<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const SHOOT_DIR_KEY = '__GOTCHI_SHOOT_DIR__' as const;

	function setShootDir(dx: number, dy: number) {
		const w = window as unknown as Record<string, unknown>;
		const len = Math.sqrt(dx * dx + dy * dy);
		if (len < 0.01) return;
		const n = len > 0 ? len : 1;
		w[SHOOT_DIR_KEY] = { dx: dx / n, dy: dy / n };
	}

	function clearShootDir() {
		const w = window as unknown as Record<string, unknown>;
		w[SHOOT_DIR_KEY] = null;
	}

	let baseEl: HTMLDivElement;
	let active = $state(false);
	let nubX = $state(0);
	let nubY = $state(0);

	const BASE_SIZE = 100;
	const NUB_SIZE = 38;
	const MAX_RADIUS = (BASE_SIZE - NUB_SIZE) / 2;

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
		// While held, keep setting aim direction so game can continuous-fire
		if (active) {
			const len = Math.sqrt(dx * dx + dy * dy);
			if (len > 8) setShootDir(dx / len, dy / len);
		}
	}

	function onPointerDown(e: PointerEvent) {
		e.preventDefault();
		active = true;
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		clampNub(e.clientX, e.clientY);
		// Set direction immediately so hold-to-fire starts
		const len = Math.sqrt(nubX * nubX + nubY * nubY);
		if (len > 8) setShootDir(nubX / len, nubY / len);
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
		clearShootDir();
	}

	onMount(() => clearShootDir());
	onDestroy(() => clearShootDir());
</script>

<div
	class="shoot-thumbpad"
	role="group"
	aria-label="Shoot control"
	tabindex="-1"
	style="touch-action: none; -webkit-user-select: none; user-select: none; width: {BASE_SIZE}px; height: {BASE_SIZE}px;"
>
	<div
		class="thumbpad-base"
		role="application"
		aria-label="Aim and shoot: drag to aim, release to fire"
		bind:this={baseEl}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointerleave={onPointerUp}
		onpointercancel={onPointerUp}
	></div>
	<div
		class="thumbpad-nub"
		style="
			width: {NUB_SIZE}px; height: {NUB_SIZE}px;
			transform: translate(calc(-50% + {nubX}px), calc(-50% + {nubY}px));
		"
		aria-hidden="true"
	></div>
</div>

<style>
	.shoot-thumbpad {
		position: absolute;
		right: 16px;
		bottom: 20px;
		z-index: 10;
		pointer-events: auto;
	}
	.shoot-thumbpad .thumbpad-base {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: rgba(120, 80, 80, 0.4);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		border: 2px solid rgba(255, 200, 100, 0.4);
	}
	.shoot-thumbpad .thumbpad-nub {
		position: absolute;
		left: 50%;
		top: 50%;
		border-radius: 50%;
		background: rgba(255, 220, 100, 0.9);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}
	@media (min-width: 640px) {
		.shoot-thumbpad {
			right: 20px;
			bottom: 24px;
		}
	}
</style>
