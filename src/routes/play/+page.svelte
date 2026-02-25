<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { selectedGotchiStore } from '$lib/stores/selectedGotchiStore';

	let game: unknown = null;

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
		const Phaser = (await import('phaser')).default;
		const { getPhaserConfig } = await import('$lib/phaser/phaserConfig');
		game = new Phaser.Game(getPhaserConfig('phaser-game-container'));
	});

	onDestroy(() => {
		if (game != null && typeof (game as { destroy?: (x: boolean) => void }).destroy === 'function') {
			(game as { destroy: (x: boolean) => void }).destroy(true);
		}
		game = null;
		(window as Window & { __GOTCHI_PLAY__?: unknown }).__GOTCHI_PLAY__ = undefined;
	});
</script>

<svelte:head>
	<title>Play – Gotchi Phaser</title>
</svelte:head>

<p class="text-sm text-surface-600 dark:text-surface-400 px-4 py-2">
	Use <kbd class="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-mono text-xs">W A S D</kbd> or
	<kbd class="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-mono text-xs">Arrow keys</kbd> to move.
</p>
<div class="h-[calc(100vh-4rem-2.5rem)] min-h-[400px] w-full flex flex-col">
	<div id="phaser-game-container" class="flex-1 w-full min-h-0"></div>
</div>
