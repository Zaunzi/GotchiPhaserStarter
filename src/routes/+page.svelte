<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { account, network } from '$lib/stores/walletStore';
	import { getAavegotchi, type Aavegotchi } from '$lib/utils/graphql';
	import { getTokenIdsOfOwner } from '$lib/utils/contracts';
	import { selectedGotchiStore } from '$lib/stores/selectedGotchiStore';
	import WalletStatus from '$lib/components/WalletStatus.svelte';
	import AnimatedStance from '$lib/components/AnimatedStance.svelte';
	import { BASE_MAINNET_ID } from '$lib/config/chains';
	import { Loader2, Ghost, Gamepad2 } from '@lucide/svelte';

	let loading = $state(false);
	let error = $state<string | null>(null);
	let myGotchis = $state<Aavegotchi[]>([]);
	let mounted = $state(false);

	const isWalletConnected = $derived($account.address !== null);
	const address = $derived($account.address);
	const chainId = $derived($network.chainId);

	onMount(() => {
		mounted = true;
	});

	async function loadGotchis() {
		if (!address) {
			error = 'Connect your wallet to see your Aavegotchis';
			return;
		}
		if (chainId !== BASE_MAINNET_ID) {
			error = 'Switch to Base network to load your Aavegotchis';
			return;
		}

		loading = true;
		error = null;
		myGotchis = [];

		try {
			const tokenIds = await getTokenIdsOfOwner(address);
			if (tokenIds.length === 0) {
				error = 'No Aavegotchis in this wallet';
				return;
			}

			const results = await Promise.all(tokenIds.map((id) => getAavegotchi(String(id))));
			const summoned = results
				.filter((g): g is Aavegotchi => g !== null && Number(g.status) === 3)
				.sort((a, b) => Number(a.tokenId) - Number(b.tokenId));
			myGotchis = summoned;

			if (summoned.length === 0) {
				error = 'No summoned Aavegotchis in this wallet';
			}
		} catch (err) {
			console.error('Failed to load gotchis:', err);
			error = err instanceof Error ? err.message : 'Failed to load Aavegotchis';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (
			mounted &&
			address &&
			chainId === BASE_MAINNET_ID &&
			myGotchis.length === 0 &&
			!loading &&
			!error
		) {
			loadGotchis();
		}
	});

	function getSpriteUrl(tokenId: string | number): string {
		return `https://gotchi.lol/api/gotchi-sprites/${tokenId}`;
	}

	function playWith(gotchi: Aavegotchi) {
		selectedGotchiStore.set({
			tokenId: gotchi.tokenId,
			name: gotchi.name || undefined,
			gotchi
		});
		goto('/play');
	}
</script>

<svelte:head>
	<title>Gotchi Phaser – Aavegotchi Template</title>
	<meta name="description" content="Connect your wallet, choose an Aavegotchi, and play in a Phaser world." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="text-center mb-8">
		<h1 class="font-aavegotchi text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-2 lowercase">
			Gotchi Phaser
		</h1>
		<p class="text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
			Connect your wallet, pick an Aavegotchi, and hit Play to spawn in the world.
		</p>
	</div>

	{#if !isWalletConnected}
		<div class="flex flex-col items-center justify-center py-12">
			<div class="card p-8 text-center max-w-md w-full">
				<Ghost class="w-16 h-16 mx-auto mb-4 text-primary-500 opacity-80" />
				<p class="text-lg text-surface-700 dark:text-surface-300 mb-6">
					Connect your wallet to see your Aavegotchis and play.
				</p>
				<div class="flex justify-center">
					<WalletStatus />
				</div>
			</div>
		</div>
	{:else if chainId !== BASE_MAINNET_ID}
		<div class="flex flex-col items-center justify-center py-4">
			<div class="card p-8 text-center border-warning max-w-md w-full">
				<p class="text-lg text-surface-700 dark:text-surface-300 mb-6">
					Please switch to Base network to load your Aavegotchis.
				</p>
				<div class="flex justify-center">
					<WalletStatus />
				</div>
			</div>
		</div>
	{:else}
		{#if error}
			<div class="alert alert-error mb-6">
				<span>{error}</span>
				<button type="button" class="btn btn-sm" onclick={() => loadGotchis()}>Retry</button>
			</div>
		{/if}

		{#if loading && myGotchis.length === 0}
			<div class="card p-12 text-center">
				<Loader2 class="w-10 h-10 animate-spin mx-auto mb-4 text-primary-500" />
				<p class="text-surface-600 dark:text-surface-400">Loading your Aavegotchis...</p>
			</div>
		{:else if myGotchis.length > 0}
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-surface-900 dark:text-surface-100">
					Choose an Aavegotchi
				</h2>
				<button type="button" class="btn btn-outline btn-sm" onclick={() => loadGotchis()} disabled={loading}>
					{#if loading}
						<Loader2 class="w-4 h-4 animate-spin" />
					{/if}
					Reload
				</button>
			</div>
			<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
				{#each myGotchis as gotchi (gotchi.tokenId)}
					<div class="card p-2 sm:p-3 flex flex-col">
						<div class="rounded-lg overflow-hidden flex items-center justify-center bg-surface-200 dark:bg-surface-800" style="height: 80px;">
							<AnimatedStance
								spriteUrl={getSpriteUrl(gotchi.tokenId)}
								stance={1}
								size={72}
							/>
						</div>
						<p class="font-semibold text-xs text-surface-900 dark:text-surface-100 truncate mt-1">
							{gotchi.name || `#${gotchi.tokenId}`}
						</p>
						<button
							type="button"
							class="btn btn-primary btn-sm mt-1.5 w-full flex items-center justify-center gap-1.5"
							onclick={() => playWith(gotchi)}
						>
							<Gamepad2 class="w-3.5 h-3.5" />
							Play
						</button>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
