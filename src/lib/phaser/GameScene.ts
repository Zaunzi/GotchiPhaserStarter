import Phaser from 'phaser';

const WORLD_SIZE = 2000;
const GRID_CELL = 64;
const SPAWN_X = WORLD_SIZE / 2;
const SPAWN_Y = WORLD_SIZE / 2;
const SPEED = 160;
const GOTCHI_FRAME_WIDTH = 100;
const GOTCHI_FRAME_HEIGHT = 100;
const GOTCHI_DISPLAY_SIZE = 128;
const PROJECTILE_SPEED = 400;
const PROJECTILE_RADIUS = 8;
const PROJECTILE_MAX_DISTANCE = 900;
const MELEE_HITBOX_SIZE = 48;
const MELEE_DURATION_MS = 400;
const SHOOT_COOLDOWN_MS = 1000;
const MELEE_COOLDOWN_MS = 1000;

declare global {
	interface Window {
		__GOTCHI_PLAY__?: { tokenId: string; name?: string };
		__GOTCHI_MOVE__?: { up: boolean; down: boolean; left: boolean; right: boolean };
		/** World coords for point-and-click shoot (desktop). Set by scene from pointer. */
		__GOTCHI_SHOOT_TARGET__?: { x: number; y: number } | null;
		/** Mobile: shoot direction when release (dx, dy normalized). Consumed by scene. */
		__GOTCHI_SHOOT_DIR__?: { dx: number; dy: number } | null;
		/** Melee attack requested (e.g. right-click or mobile button). Consumed by scene. */
		__GOTCHI_MELEE__?: boolean;
	}
}

export default class GameScene extends Phaser.Scene {
	private player!: Phaser.GameObjects.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private wasd!: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	private velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
	private projectiles!: Phaser.GameObjects.Group;
	private lastShootTime = 0;
	private lastMeleeTime = 0;
	private meleeHitbox: Phaser.GameObjects.Rectangle | null = null;
	private meleeHitboxTime = 0;
	private actionAnimPlaying = false;
	private shootHeld = false;
	private shootTargetX = 0;
	private shootTargetY = 0;
	private rightMouseHeld = false;

	constructor() {
		super({ key: 'GameScene' });
	}

	preload() {
		const data = window.__GOTCHI_PLAY__;
		if (!data?.tokenId) return;
		const url = `https://gotchi.lol/api/gotchi-sprites/${data.tokenId}`;
		this.load.spritesheet('gotchi', url, {
			frameWidth: GOTCHI_FRAME_WIDTH,
			frameHeight: GOTCHI_FRAME_HEIGHT
		});
	}

	create() {
		// Purple background
		this.cameras.main.setBackgroundColor(0x2d1b4e);

		// Grid
		const g = this.add.graphics();
		g.lineStyle(1, 0x4a2c7a, 0.6);
		for (let x = 0; x <= WORLD_SIZE; x += GRID_CELL) {
			g.lineBetween(x, 0, x, WORLD_SIZE);
		}
		for (let y = 0; y <= WORLD_SIZE; y += GRID_CELL) {
			g.lineBetween(0, y, WORLD_SIZE, y);
		}
		g.strokePath();

		// World and camera bounds
		this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
		this.physics?.world?.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

		const data = window.__GOTCHI_PLAY__;
		if (!data?.tokenId || !this.textures.exists('gotchi')) return;

		// Idle: row 0, frames 0–5 (6 frames). Move: row 1, frames 7–13 (7 frames) — same as GotchiViewer AavegotchiDemoScene
		if (!this.anims.exists('gotchi-idle')) {
			this.anims.create({
				key: 'gotchi-idle',
				frames: this.anims.generateFrameNumbers('gotchi', { start: 0, end: 5 }),
				frameRate: 8,
				repeat: -1
			});
		}
		if (!this.anims.exists('gotchi-move')) {
			this.anims.create({
				key: 'gotchi-move',
				frames: this.anims.generateFrameNumbers('gotchi', { start: 7, end: 13 }),
				frameRate: 8,
				repeat: -1
			});
		}
		// AnimatedStance: 1=Idle, 2=Sprint, 3=Shoot, 4=Melee, 5=Hurt, 6=... (framesPerRow [6,7,3,6,4,6]). Sheet 10 frames per row.
		// Shoot = animation 2 (row 1, 7 frames). Melee = animation 3 (row 2, 3 frames).
		if (!this.anims.exists('gotchi-shoot')) {
			this.anims.create({
				key: 'gotchi-shoot',
				frames: this.anims.generateFrameNumbers('gotchi', { start: 10, end: 16 }),
				frameRate: 10,
				repeat: 0
			});
		}
		if (!this.anims.exists('gotchi-melee')) {
			this.anims.create({
				key: 'gotchi-melee',
				frames: this.anims.generateFrameNumbers('gotchi', { start: 20, end: 22 }),
				frameRate: 12,
				repeat: 0
			});
		}

		// Yellow orb projectile texture
		const orbGraphics = this.add.graphics();
		orbGraphics.fillStyle(0xffdd00, 1);
		orbGraphics.fillCircle(PROJECTILE_RADIUS, PROJECTILE_RADIUS, PROJECTILE_RADIUS - 2);
		orbGraphics.generateTexture('orb', PROJECTILE_RADIUS * 2, PROJECTILE_RADIUS * 2);
		orbGraphics.destroy();

		this.projectiles = this.add.group({ classType: Phaser.GameObjects.Image });

		this.textures.get('gotchi').setFilter(Phaser.Textures.FilterMode.NEAREST);
		this.player = this.add.sprite(SPAWN_X, SPAWN_Y, 'gotchi', 0);
		this.player.setDisplaySize(GOTCHI_DISPLAY_SIZE, GOTCHI_DISPLAY_SIZE);
		this.player.setOrigin(0.5, 0.5);
		this.player.play('gotchi-idle', true);
		this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
			this.actionAnimPlaying = false;
		});

		this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.wasd = {
			W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
		};

		this.input.mouse?.disableContextMenu();

		// Left click: shoot (hold for continuous). Right click: melee (hold for continuous).
		this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
			if (pointer.leftButtonDown()) {
				this.shootHeld = true;
				const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
				this.shootTargetX = world.x;
				this.shootTargetY = world.y;
				this.tryShootToward(this.shootTargetX, this.shootTargetY);
			}
			if (pointer.rightButtonDown()) {
				this.rightMouseHeld = true;
				this.tryMelee();
			}
		});
		this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
			if (this.shootHeld && pointer.leftButtonDown()) {
				const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
				this.shootTargetX = world.x;
				this.shootTargetY = world.y;
			}
		});
		this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
			if (!pointer.leftButtonDown()) this.shootHeld = false;
			if (!pointer.rightButtonDown()) this.rightMouseHeld = false;
		});
		this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
			this.shootHeld = false;
			this.rightMouseHeld = false;
		});
	}

	private tryShootToward(targetX: number, targetY: number) {
		const now = this.time.now;
		if (now - this.lastShootTime < SHOOT_COOLDOWN_MS) return;
		const dx = targetX - this.player.x;
		const dy = targetY - this.player.y;
		const len = Math.sqrt(dx * dx + dy * dy);
		if (len < 10) return;
		const nx = dx / len;
		const ny = dy / len;
		this.actionAnimPlaying = true;
		this.player.play('gotchi-shoot', true);
		this.lastShootTime = now;

		const orb = this.add.image(this.player.x, this.player.y, 'orb');
		orb.setDisplaySize(PROJECTILE_RADIUS * 2, PROJECTILE_RADIUS * 2);
		orb.setOrigin(0.5, 0.5);
		orb.setDepth(10);
		orb.setData('vx', nx * PROJECTILE_SPEED);
		orb.setData('vy', ny * PROJECTILE_SPEED);
		orb.setData('spawnX', this.player.x);
		orb.setData('spawnY', this.player.y);
		this.projectiles.add(orb);
	}

	private tryMelee() {
		const now = this.time.now;
		if (now - this.lastMeleeTime < MELEE_COOLDOWN_MS) return;
		this.actionAnimPlaying = true;
		this.player.play('gotchi-melee', true);
		this.lastMeleeTime = now;
		const faceLeft = this.player.flipX;
		const offsetX = faceLeft ? -MELEE_HITBOX_SIZE : MELEE_HITBOX_SIZE;
		const x = this.player.x + offsetX * 0.6;
		const y = this.player.y;
		if (this.meleeHitbox) this.meleeHitbox.destroy();
		this.meleeHitbox = this.add.rectangle(x, y, MELEE_HITBOX_SIZE, MELEE_HITBOX_SIZE, 0xff69b4, 0.45);
		this.meleeHitbox.setDepth(5);
		this.meleeHitboxTime = now + MELEE_DURATION_MS;
	}

	update() {
		const now = this.time.now;

		// Melee hitbox duration
		if (this.meleeHitbox && now >= this.meleeHitboxTime) {
			this.meleeHitbox.destroy();
			this.meleeHitbox = null;
		}

		// Move projectiles and destroy after max distance
		const dt = this.game.loop.delta / 1000;
		this.projectiles.getChildren().forEach((obj) => {
			const orb = obj as Phaser.GameObjects.Image;
			const vx = orb.getData('vx') as number | undefined;
			const vy = orb.getData('vy') as number | undefined;
			const sx = orb.getData('spawnX') as number | undefined;
			const sy = orb.getData('spawnY') as number | undefined;
			if (vx != null && vy != null) {
				orb.x += vx * dt;
				orb.y += vy * dt;
			}
			if (sx != null && sy != null) {
				const dist = Phaser.Math.Distance.Between(sx, sy, orb.x, orb.y);
				if (dist >= PROJECTILE_MAX_DISTANCE) orb.destroy();
			}
		});

		// Hold-to-fire: left click or shoot thumbpad (direction set while held)
		if (this.shootHeld) {
			this.tryShootToward(this.shootTargetX, this.shootTargetY);
		} else {
			const shootDir = window.__GOTCHI_SHOOT_DIR__;
			if (shootDir && Math.abs(shootDir.dx) + Math.abs(shootDir.dy) > 0.1) {
				const tx = this.player.x + shootDir.dx * 500;
				const ty = this.player.y + shootDir.dy * 500;
				this.tryShootToward(tx, ty);
			}
		}
		// Hold-to-melee: right click or melee button (game does not clear __GOTCHI_MELEE__; button clears on release)
		if (this.rightMouseHeld || window.__GOTCHI_MELEE__) {
			this.tryMelee();
		}

		this.velocity.set(0, 0);

		const touch = window.__GOTCHI_MOVE__;
		const up = this.wasd.W.isDown || this.cursors.up.isDown || touch?.up;
		const down = this.wasd.S.isDown || this.cursors.down.isDown || touch?.down;
		const left = this.wasd.A.isDown || this.cursors.left.isDown || touch?.left;
		const right = this.wasd.D.isDown || this.cursors.right.isDown || touch?.right;

		if (up) this.velocity.y = -SPEED;
		else if (down) this.velocity.y = SPEED;
		if (left) this.velocity.x = -SPEED;
		else if (right) this.velocity.x = SPEED;

		const isMoving = this.velocity.x !== 0 || this.velocity.y !== 0;

		if (isMoving) {
			if (this.velocity.x !== 0 && this.velocity.y !== 0) this.velocity.normalize().scale(SPEED);
			this.player.x = Phaser.Math.Clamp(
				this.player.x + this.velocity.x * dt,
				GOTCHI_DISPLAY_SIZE / 2,
				WORLD_SIZE - GOTCHI_DISPLAY_SIZE / 2
			);
			this.player.y = Phaser.Math.Clamp(
				this.player.y + this.velocity.y * dt,
				GOTCHI_DISPLAY_SIZE / 2,
				WORLD_SIZE - GOTCHI_DISPLAY_SIZE / 2
			);

			if (this.velocity.x < 0) this.player.setFlipX(true);
			else if (this.velocity.x > 0) this.player.setFlipX(false);

			if (!this.actionAnimPlaying && this.player.anims.currentAnim?.key !== 'gotchi-move') this.player.play('gotchi-move', true);
		} else {
			if (!this.actionAnimPlaying && this.player.anims.currentAnim?.key !== 'gotchi-idle') this.player.play('gotchi-idle', true);
		}
	}
}
