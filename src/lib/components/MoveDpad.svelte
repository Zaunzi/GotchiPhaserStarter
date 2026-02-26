<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from '@lucide/svelte';

	const MOVE_KEY = '__GOTCHI_MOVE__' as const;

	function getMove(): { up: boolean; down: boolean; left: boolean; right: boolean } {
		const w = window as unknown as Record<string, unknown>;
		if (!w[MOVE_KEY]) w[MOVE_KEY] = { up: false, down: false, left: false, right: false };
		return w[MOVE_KEY] as { up: boolean; down: boolean; left: boolean; right: boolean };
	}

	function setDir(dir: 'up' | 'down' | 'left' | 'right', value: boolean) {
		const m = getMove();
		m[dir] = value;
	}

	function clearAll() {
		const m = getMove();
		m.up = m.down = m.left = m.right = false;
	}

	let handleUp: () => void;
	onMount(() => {
		clearAll();
		handleUp = () => clearAll();
		window.addEventListener('pointerup', handleUp);
		window.addEventListener('pointercancel', handleUp);
	});

	onDestroy(() => {
		clearAll();
		if (handleUp) {
			window.removeEventListener('pointerup', handleUp);
			window.removeEventListener('pointercancel', handleUp);
		}
	});
</script>

<div
	class="move-dpad"
	role="group"
	aria-label="Movement controls"
	tabindex="-1"
	style="touch-action: none; -webkit-user-select: none; user-select: none;"
>
	<div class="dpad-row">
		<button
			type="button"
			class="dpad-btn dpad-up"
			aria-label="Move up"
			onpointerdown={(e) => { e.preventDefault(); setDir('up', true); }}
			onpointerup={() => setDir('up', false)}
			onpointerleave={() => setDir('up', false)}
		>
			<span class="dpad-icon"><ChevronUp /></span>
		</button>
	</div>
	<div class="dpad-row dpad-mid">
		<button
			type="button"
			class="dpad-btn dpad-left"
			aria-label="Move left"
			onpointerdown={(e) => { e.preventDefault(); setDir('left', true); }}
			onpointerup={() => setDir('left', false)}
			onpointerleave={() => setDir('left', false)}
		>
			<span class="dpad-icon"><ChevronLeft /></span>
		</button>
		<div class="dpad-center" aria-hidden="true"></div>
		<button
			type="button"
			class="dpad-btn dpad-right"
			aria-label="Move right"
			onpointerdown={(e) => { e.preventDefault(); setDir('right', true); }}
			onpointerup={() => setDir('right', false)}
			onpointerleave={() => setDir('right', false)}
		>
			<span class="dpad-icon"><ChevronRight /></span>
		</button>
	</div>
	<div class="dpad-row">
		<button
			type="button"
			class="dpad-btn dpad-down"
			aria-label="Move down"
			onpointerdown={(e) => { e.preventDefault(); setDir('down', true); }}
			onpointerup={() => setDir('down', false)}
			onpointerleave={() => setDir('down', false)}
		>
			<span class="dpad-icon"><ChevronDown /></span>
		</button>
	</div>
</div>

<style>
	.move-dpad {
		position: absolute;
		left: 12px;
		bottom: 16px;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		pointer-events: auto;
	}
	.dpad-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
	}
	.dpad-mid {
		gap: 0;
	}
	.dpad-center {
		width: 44px;
		height: 44px;
		min-width: 44px;
		min-height: 44px;
	}
	.dpad-btn {
		width: 48px;
		height: 48px;
		min-width: 48px;
		min-height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.35);
		color: rgba(255, 255, 255, 0.95);
		border: 2px solid rgba(255, 255, 255, 0.25);
		cursor: pointer;
		transition: background 0.1s, transform 0.05s;
		-webkit-tap-highlight-color: transparent;
	}
	.dpad-btn:hover {
		background: rgba(0, 0, 0, 0.5);
	}
	.dpad-btn:active {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(0.96);
	}
	.dpad-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		pointer-events: none;
	}
	@media (min-width: 640px) {
		.move-dpad {
			left: 16px;
			bottom: 20px;
		}
		.dpad-btn {
			width: 52px;
			height: 52px;
			min-width: 52px;
			min-height: 52px;
		}
		.dpad-center {
			width: 48px;
			height: 48px;
			min-width: 48px;
			min-height: 48px;
		}
		.dpad-icon {
			width: 30px;
			height: 30px;
		}
	}
</style>
