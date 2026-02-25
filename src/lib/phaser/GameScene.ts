import Phaser from 'phaser';

const WORLD_SIZE = 2000;
const GRID_CELL = 64;
const SPAWN_X = WORLD_SIZE / 2;
const SPAWN_Y = WORLD_SIZE / 2;
const SPEED = 160;
const GOTCHI_FRAME_WIDTH = 100;
const GOTCHI_FRAME_HEIGHT = 100;
const GOTCHI_DISPLAY_SIZE = 64;

declare global {
	interface Window {
		__GOTCHI_PLAY__?: { tokenId: string; name?: string };
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

		this.textures.get('gotchi').setFilter(Phaser.Textures.FilterMode.NEAREST);
		this.player = this.add.sprite(SPAWN_X, SPAWN_Y, 'gotchi', 0);
		this.player.setDisplaySize(GOTCHI_DISPLAY_SIZE, GOTCHI_DISPLAY_SIZE);
		this.player.setOrigin(0.5, 0.5);
		this.player.play('gotchi-idle', true);

		this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

		this.cursors = this.input.keyboard!.createCursorKeys();
		this.wasd = {
			W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
		};
	}

	update() {
		this.velocity.set(0, 0);

		if (this.wasd.W.isDown || this.cursors.up.isDown) this.velocity.y = -SPEED;
		else if (this.wasd.S.isDown || this.cursors.down.isDown) this.velocity.y = SPEED;
		if (this.wasd.A.isDown || this.cursors.left.isDown) this.velocity.x = -SPEED;
		else if (this.wasd.D.isDown || this.cursors.right.isDown) this.velocity.x = SPEED;

		const dt = this.game.loop.delta / 1000;
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

			if (this.player.anims.currentAnim?.key !== 'gotchi-move') this.player.play('gotchi-move', true);
		} else {
			if (this.player.anims.currentAnim?.key !== 'gotchi-idle') this.player.play('gotchi-idle', true);
		}
	}
}
