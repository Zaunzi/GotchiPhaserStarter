<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const MOVE_KEY = '__GOTCHI_MOVE__' as const;

	function getMove(): { up: boolean; down: boolean; left: boolean; right: boolean } {
		const w = window as unknown as Record<string, unknown>;
		if (!w[MOVE_KEY]) w[MOVE_KEY] = { up: false, down: false, left: false, right: false };
		return w[MOVE_KEY] as { up: boolean; down: boolean; left: boolean; right: boolean };
	}

	function setMove(up: boolean, down: boolean, left: boolean, right: boolean) {
		const m = getMove();
		m.up = up;
		m.down = down;
		m.left = left;
		m.right = right;
	}

	function clearAll() {
		setMove(false, false, false, false);
	}

	let baseEl: HTMLDivElement;
	let nubEl: HTMLDivElement;
	let active = $state(false);
	let nubX = $state(0);
	let nubY = $state(0);

	const BASE_SIZE = 120;
	const NUB_SIZE = 44;
	const MAX_RADIUS = (BASE_SIZE - NUB_SIZE) / 2;
	const DEADZONE = 0.2;

	function getCenter(): { x: number; y: number } {
		const r = baseEl?.getBoundingClientRect();
		if (!r) return { x: 0, y: 0 };
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	}

	function clampNub(clientX: number, clientY: number) {
		const c = getCenter();
		let dx = clientX - c.x;
		let dy = clientY - c.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > MAX_RADIUS && dist > 0) {
			const s = MAX_RADIUS / dist;
			dx *= s;
			dy *= s;
		}
		nubX = dx;
		nubY = dy;

		const norm = Math.max(MAX_RADIUS * DEADZONE, 1);
		const up = dy < -norm;
		const down = dy > norm;
		const left = dx < -norm;
		const right = dx > norm;
		setMove(up, down, left, right);
	}

	function onPointerDown(e: PointerEvent) {
		e.preventDefault();
		active = true;
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		clampNub(e.clientX, e.clientY);
	}

	function onPointerMove(e: PointerEvent) {
		if (!active) return;
		clampNub(e.clientX, e.clientY);
	}

	function onPointerUp(e: PointerEvent) {
		if (!active) return;
		(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
		active = false;
		nubX = 0;
		nubY = 0;
		clearAll();
	}

	onMount(() => clearAll());
	onDestroy(() => clearAll());
</script>

<div
	class="thumbpad"
	role="group"
	aria-label="Movement thumbpad"
	tabindex="-1"
	style="touch-action: none; -webkit-user-select: none; user-select: none; width: {BASE_SIZE}px; height: {BASE_SIZE}px;"
>
	<div
		class="thumbpad-base"
		role="application"
		aria-label="Virtual joystick for movement"
		bind:this={baseEl}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointerleave={onPointerUp}
		onpointercancel={onPointerUp}
	></div>
	<div
		class="thumbpad-nub"
		bind:this={nubEl}
		style="
			width: {NUB_SIZE}px; height: {NUB_SIZE}px;
			transform: translate(calc(-50% + {nubX}px), calc(-50% + {nubY}px));
		"
		aria-hidden="true"
	></div>
</div>

<style>
	.thumbpad {
		position: absolute;
		left: 16px;
		bottom: 20px;
		z-index: 10;
		pointer-events: auto;
	}
	.thumbpad-base {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: rgba(180, 180, 180, 0.35);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}
	.thumbpad-nub {
		position: absolute;
		left: 50%;
		top: 50%;
		border-radius: 50%;
		background: rgba(200, 200, 200, 0.95);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}
	@media (min-width: 640px) {
		.thumbpad {
			left: 20px;
			bottom: 24px;
		}
	}
</style>
