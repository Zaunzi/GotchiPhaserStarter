<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		spriteUrl: string;
		/** 1 = Idle, 2 = Sprint, etc. Character select uses 1 (idle). */
		stance: 1 | 2 | 3 | 4 | 5 | 6;
		frameWidth?: number;
		frameHeight?: number;
		framesPerRow?: number[];
		fps?: number;
		/** Canvas width/height in px; sprite is scaled to fit */
		size?: number;
	}

	let {
		spriteUrl,
		stance,
		frameWidth = 100,
		frameHeight = 100,
		framesPerRow = [6, 7, 3, 6, 4, 6],
		fps = 8,
		size = 100
	}: Props = $props();

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let imgEl = $state<HTMLImageElement | null>(null);
	let error = $state(false);

	const current = { rowIndex: 0, frameCount: 6, frameIntervalMs: 125, frameWidth: 100, frameHeight: 100 };
	$effect(() => {
		current.rowIndex = stance - 1;
		current.frameCount = framesPerRow[stance - 1] ?? 6;
		current.frameIntervalMs = 1000 / fps;
		current.frameWidth = frameWidth;
		current.frameHeight = frameHeight;
	});

	let frameIndex = 0;
	let lastTime = 0;
	let rafId: number | null = null;

	function drawFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
		const sx = frameIndex * current.frameWidth;
		const sy = current.rowIndex * current.frameHeight;
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, size, size);
		ctx.drawImage(img, sx, sy, current.frameWidth, current.frameHeight, 0, 0, size, size);
	}

	function tick(t: number) {
		if (!canvasEl || !imgEl || !imgEl.complete) {
			rafId = requestAnimationFrame(tick);
			return;
		}
		const ctx = canvasEl.getContext('2d');
		if (!ctx) {
			rafId = requestAnimationFrame(tick);
			return;
		}
		if (t - lastTime >= current.frameIntervalMs) {
			frameIndex = (frameIndex + 1) % current.frameCount;
			lastTime = t;
		}
		drawFrame(ctx, imgEl);
		rafId = requestAnimationFrame(tick);
	}

	function startAnimation() {
		lastTime = performance.now();
		frameIndex = 0;
		rafId = requestAnimationFrame(tick);
	}

	function stopAnimation() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	$effect(() => {
		stance;
		if (imgEl?.complete && canvasEl) {
			stopAnimation();
			startAnimation();
		}
	});

	onMount(() => {
		if (imgEl?.complete && canvasEl) startAnimation();
	});

	onDestroy(() => {
		stopAnimation();
	});
</script>

<div class="animate-stance relative inline-block bg-surface-200 dark:bg-surface-800 rounded-lg overflow-hidden" style="width: {size}px; height: {size}px;">
	<img
		bind:this={imgEl}
		src={spriteUrl}
		alt=""
		class="absolute w-0 h-0 opacity-0 pointer-events-none"
		loading="lazy"
		onerror={() => { error = true; }}
		onload={() => {
			if (canvasEl && imgEl) {
				stopAnimation();
				startAnimation();
			}
		}}
	/>
	{#if error}
		<div class="w-full h-full flex items-center justify-center text-surface-500 text-xs">
			No sprite
		</div>
	{:else}
		<canvas
			bind:this={canvasEl}
			width={size}
			height={size}
			class="block w-full h-full"
			style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;"
		></canvas>
	{/if}
</div>
