<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { selectedGotchiStore } from '$lib/stores/selectedGotchiStore';
	import Thumbpad from '$lib/components/Thumbpad.svelte';

	let game: import('phaser').Game | null = null;
	let resizeObserver: ResizeObserver | null = null;

	onMount(async () => {
		const selected = get(selectedGotchiStore);
		if (!selected?.tokenId) {
			goto('/');
			return;
		}
		(window as Window & { __GOTCHI_PLAY__?: { tokenId: string; name?: string } }).__GOTCHI_PLAY__ = {
			tokenId: selected.tokenId,
			name: selected.name
		};

		const el = document.getElementById('phaser-game-container') as HTMLDivElement;
		if (!el) return;

		const w = el.clientWidth;
		const h = el.clientHeight;

		const Phaser = (await import('phaser')).default;
		const { getPhaserConfig } = await import('$lib/phaser/phaserConfig');
		game = new Phaser.Game(getPhaserConfig('phaser-game-container', w, h)) as import('phaser').Game;

		resizeObserver = new ResizeObserver(() => {
			if (game && el) {
				const cw = el.clientWidth;
				const ch = el.clientHeight;
				game.scale.resize(cw, ch);
			}
		});
		resizeObserver.observe(el);
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
		resizeObserver = null;
		if (game != null && typeof game.destroy === 'function') {
			game.destroy(true);
		}
		game = null;
		(window as Window & { __GOTCHI_PLAY__?: unknown }).__GOTCHI_PLAY__ = undefined;
	});
</script>

<svelte:head>
	<title>Play – Gotchi Phaser</title>
</svelte:head>

<!-- Full viewport below navbar (navbar is h-16 = 4rem). No scrollbar. -->
<div class="play-root">
	<div id="phaser-game-container" class="game-container"></div>
	<p class="hint-overlay" aria-hidden="true">
		<kbd>W A S D</kbd> or <kbd>Arrow keys</kbd> to move
	</p>
	<Thumbpad />
</div>

<style>
	.play-root {
		height: calc(100vh - 4rem);
		height: calc(100dvh - 4rem);
		min-height: 0;
		overflow: hidden;
		position: relative;
		display: flex;
		flex-direction: column;
	}
	.game-container {
		flex: 1;
		min-height: 0;
		width: 100%;
		position: relative;
		overflow: hidden;
	}
	.hint-overlay {
		position: absolute;
		top: 8px;
		right: 8px;
		margin: 0;
		padding: 6px 10px;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		background: rgba(0, 0, 0, 0.35);
		border-radius: 8px;
		pointer-events: none;
		z-index: 5;
	}
	.hint-overlay kbd {
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.2);
		font-family: inherit;
		font-size: 0.7rem;
	}
</style>
