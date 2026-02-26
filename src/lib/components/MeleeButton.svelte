<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Swords } from '@lucide/svelte';

	const MELEE_KEY = '__GOTCHI_MELEE__' as const;

	function triggerMelee() {
		const w = window as unknown as Record<string, unknown>;
		w[MELEE_KEY] = true;
	}

	function clearMelee() {
		const w = window as unknown as Record<string, unknown>;
		w[MELEE_KEY] = false;
	}

	onMount(() => clearMelee());
	onDestroy(() => clearMelee());
</script>

<button
	type="button"
	class="melee-btn"
	aria-label="Melee attack (hold for continuous)"
	style="touch-action: none; -webkit-tap-highlight-color: transparent;"
	onpointerdown={(e) => { e.preventDefault(); triggerMelee(); }}
	onpointerup={() => clearMelee()}
	onpointerleave={() => clearMelee()}
>
	<span class="melee-icon"><Swords /></span>
</button>

<style>
	.melee-btn {
		position: absolute;
		right: 16px;
		bottom: 130px;
		z-index: 10;
		width: 52px;
		height: 52px;
		min-width: 52px;
		min-height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		background: rgba(180, 60, 40, 0.5);
		color: rgba(255, 255, 255, 0.95);
		border: 2px solid rgba(255, 150, 100, 0.4);
		cursor: pointer;
		transition: background 0.1s, transform 0.05s;
		pointer-events: auto;
	}
	.melee-btn:hover {
		background: rgba(200, 80, 50, 0.6);
	}
	.melee-btn:active {
		background: rgba(255, 120, 80, 0.5);
		transform: scale(0.96);
	}
	.melee-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		pointer-events: none;
	}
	@media (min-width: 640px) {
		.melee-btn {
			right: 20px;
			bottom: 140px;
			width: 56px;
			height: 56px;
			min-width: 56px;
			min-height: 56px;
		}
		.melee-icon {
			width: 30px;
			height: 30px;
		}
	}
</style>
