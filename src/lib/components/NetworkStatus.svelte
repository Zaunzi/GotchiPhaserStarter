<script lang="ts">
	import { network, isChainSupported, getChainName, getChainInfo } from '$lib/stores/walletStore';
	import { CheckCircle, AlertTriangle, Wifi, WifiOff } from '@lucide/svelte';

	// Check if we're online
	let isOnline = true;
	
	if (typeof window !== 'undefined') {
		isOnline = navigator.onLine;
		window.addEventListener('online', () => isOnline = true);
		window.addEventListener('offline', () => isOnline = false);
	}
</script>

<div class="flex items-center space-x-2">
	<!-- Online/Offline Status -->
	<div class="flex items-center space-x-1">
		{#if isOnline}
			<Wifi class="w-4 h-4 text-green-500" />
			<span class="text-xs text-green-600 dark:text-green-400">Online</span>
		{:else}
			<WifiOff class="w-4 h-4 text-red-500" />
			<span class="text-xs text-red-600 dark:text-red-400">Offline</span>
		{/if}
	</div>

	<!-- Network Status -->
	{#if $network.chainId}
		<div class="flex items-center space-x-1">
			{#if isChainSupported($network.chainId)}
				<CheckCircle class="w-4 h-4 text-green-500" />
				<span class="text-xs text-green-600 dark:text-green-400">
					{getChainName($network.chainId)}
				</span>
			{:else}
				<AlertTriangle class="w-4 h-4 text-yellow-500" />
				<span class="text-xs text-yellow-600 dark:text-yellow-400">
					Unsupported Network
				</span>
			{/if}
		</div>
	{:else}
		<div class="flex items-center space-x-1">
			<AlertTriangle class="w-4 h-4 text-gray-500" />
			<span class="text-xs text-gray-600 dark:text-gray-400">No Network</span>
		</div>
	{/if}
</div>