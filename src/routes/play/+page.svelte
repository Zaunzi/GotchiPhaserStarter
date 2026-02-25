<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import Phaser from 'phaser';
	import { selectedGotchiStore } from '$lib/stores/selectedGotchiStore';
	import { getPhaserConfig } from '$lib/phaser/phaserConfig';

	let game: Phaser.Game | null = null;

	onMount(() => {
		const selected = get(selectedGotchiStore);
		if (!selected?.tokenId) {
			goto('/');
			return;
		}
		(window as Window & { __GOTCHI_PLAY__?: { tokenId: string; name?: string } }).__GOTCHI_PLAY__ = {
			tokenId: selected.tokenId,
			name: selected.name
		};
		game = new Phaser.Game(getPhaserConfig('phaser-game-container'));
	});

	onDestroy(() => {
		if (game) {
			game.destroy(true);
			game = null;
		}
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
