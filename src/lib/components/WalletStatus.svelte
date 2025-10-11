<script lang="ts">
	import { account, network, isWalletConnected, isLoading, error, walletActions, isChainSupported, getChainName } from '$lib/stores/walletStore';
	import { Copy, ExternalLink, Wallet, AlertCircle, Loader2 } from '@lucide/svelte';

	// Format address for display
	function formatAddress(address: string): string {
		if (!address) return '';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}

	// Copy address to clipboard
	async function copyAddress() {
		if ($account.address) {
			await navigator.clipboard.writeText($account.address);
		}
	}

	// Open address in explorer
	function openInExplorer() {
		if ($account.address && $network.chainId) {
			const explorer = $network.chainId === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';
			window.open(`${explorer}/address/${$account.address}`, '_blank');
		}
	}

	// Handle network switch
	function handleNetworkSwitch() {
		if ($network.chainId && !isChainSupported($network.chainId)) {
			walletActions.switchNetwork(84532); // Switch to Base Sepolia
		}
	}
</script>

<div class="flex items-center space-x-3">
	{#if $isWalletConnected}
		<!-- Connected State -->
		<div class="flex items-center space-x-3">
			<!-- Network Status -->
			{#if $network.chainId}
				<div class="flex items-center space-x-2">
					{#if isChainSupported($network.chainId)}
						<div class="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
							<div class="w-2 h-2 bg-green-500 rounded-full"></div>
							<span class="text-xs font-medium text-green-700 dark:text-green-300">
								{getChainName($network.chainId)}
							</span>
						</div>
					{:else}
						<div class="flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
							<AlertCircle class="w-3 h-3 text-red-600 dark:text-red-400" />
							<button 
								onclick={handleNetworkSwitch} 
								class="text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
							>
								Switch Network
							</button>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Wallet Address -->
			<div class="flex items-center space-x-2 px-3 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
				<Wallet class="w-4 h-4 text-surface-600 dark:text-surface-400" />
				<span class="text-sm font-mono text-surface-700 dark:text-surface-300">
					{formatAddress($account.address || '')}
				</span>
				<div class="flex items-center space-x-1">
					<button 
						onclick={copyAddress}
						class="p-1 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
						title="Copy address"
					>
						<Copy class="w-3 h-3" />
					</button>
					<button 
						onclick={openInExplorer}
						class="p-1 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
						title="View in explorer"
					>
						<ExternalLink class="w-3 h-3" />
					</button>
					<button 
						onclick={walletActions.disconnect} 
						class="px-2 py-1 text-xs text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700 rounded transition-colors"
					>
						Disconnect
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Disconnected State -->
		<button 
			onclick={walletActions.open} 
			disabled={$isLoading}
			class="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-300 dark:disabled:bg-surface-700 text-white disabled:text-surface-500 dark:disabled:text-surface-400 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md disabled:shadow-none"
		>
			{#if $isLoading}
				<Loader2 class="w-4 h-4 animate-spin" />
				<span>Connecting...</span>
			{:else}
				<Wallet class="w-4 h-4" />
				<span>Connect Wallet</span>
			{/if}
		</button>
	{/if}

	<!-- Error Display -->
	{#if $error}
		<div class="flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
			<AlertCircle class="w-3 h-3 text-red-600 dark:text-red-400" />
			<span class="text-xs text-red-700 dark:text-red-300">{$error}</span>
			<button 
				onclick={walletActions.clearError}
				class="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
			>
				×
			</button>
		</div>
	{/if}
</div>
