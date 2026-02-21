import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { modal, initAppKit } from '../config/appkit'
import {
  BASE_MAINNET_ID,
  BASE_SEPOLIA_ID,
  SUPPORTED_CHAIN_IDS,
  getChainName as getChainNameFromChains,
  getChainInfo as getChainInfoFromChains,
  isChainSupported as isChainSupportedFromChains
} from '../config/chains'
import type { WalletState, ChainInfo } from '../../app.d.ts'

// Initial state
const initialState: WalletState = {
  account: {
    isConnected: false
  },
  network: {},
  theme: {
    themeMode: 'dark',
    themeVariables: {}
  },
  isInitialized: false,
  isLoading: false
}

// Create the main wallet store
export const walletStore = writable<WalletState>(initialState)

// Derived stores for easy access
export const account = derived(walletStore, $store => $store.account)
export const network = derived(walletStore, $store => $store.network)
export const theme = derived(walletStore, $store => $store.theme)
export const isWalletConnected = derived(walletStore, $store => $store.account.isConnected)
export const isLoading = derived(walletStore, $store => $store.isLoading)
export const error = derived(walletStore, $store => $store.error)

// Initialize AppKit subscriptions once
let isInitialized = false

function initializeWalletStore() {
  if (!browser || isInitialized || !modal) return

  isInitialized = true

  // Subscribe to account changes
  modal.subscribeAccount((accountState) => {
    walletStore.update(state => ({
      ...state,
      account: {
        address: accountState.address,
        isConnected: accountState.isConnected || false,
        chainId: accountState.caipAddress ? parseInt(accountState.caipAddress.split(':')[1]) : undefined
      },
      isLoading: false,
      error: undefined
    }))
  })

  // Subscribe to network changes
  modal.subscribeNetwork((networkState) => {
    walletStore.update(state => ({
      ...state,
      network: {
        chainId: typeof networkState.chainId === 'string' ? parseInt(networkState.chainId) : networkState.chainId,
        name: networkState.caipNetworkId || 'Unknown'
      }
    }))
  })

  // Subscribe to theme changes
  modal.subscribeTheme((themeState) => {
    walletStore.update(state => ({
      ...state,
      theme: {
        themeMode: themeState.themeMode || 'dark',
        themeVariables: themeState.themeVariables as Record<string, string> || {}
      }
    }))
    
    // Update document theme
    if (browser) {
      document.documentElement.setAttribute('data-mode', themeState.themeMode || 'dark')
    }
  })

  // Mark as initialized
  walletStore.update(state => ({
    ...state,
    isInitialized: true
  }))
}

/**
 * Initialize wallet store and AppKit. Call once from the client layout (e.g. onMount).
 * Idempotent; safe to call multiple times.
 */
export async function initWalletStore(): Promise<void> {
  if (!browser) return
  await initAppKit()
  initializeWalletStore()
}

// Wallet actions
export const walletActions = {
  // Open wallet modal
  open: () => {
    if (modal) {
      walletStore.update(state => ({ ...state, isLoading: true, error: undefined }))
      modal.open()
    }
  },

  // Close wallet modal
  close: () => {
    if (modal) modal.close()
  },

  // Switch network
  switchNetwork: async (chainId: number) => {
    if (!modal) return
    const { base, baseSepolia } = await import('@reown/appkit/networks')
    const targetNetwork = [base, baseSepolia].find(net => net.id === chainId)
    if (targetNetwork) {
      walletStore.update(state => ({ ...state, isLoading: true, error: undefined }))
      try {
        await modal.switchNetwork(targetNetwork)
      } catch (err) {
        walletStore.update(state => ({
          ...state,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to switch network'
        }))
      }
    }
  },

  // Disconnect wallet
  disconnect: async () => {
    if (modal) {
      walletStore.update(state => ({ ...state, isLoading: true, error: undefined }))
      try {
        await modal.disconnect()
        // Reset to initial state
        walletStore.update(state => ({
          ...state,
          account: { isConnected: false },
          network: {},
          isLoading: false,
          error: undefined
        }))
      } catch (err) {
        walletStore.update(state => ({
          ...state,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to disconnect'
        }))
      }
    }
  },

  // Get wallet provider
  getProvider: (): any => {
    if (modal) {
      return modal.getWalletProvider()
    }
    return null
  },

  // Clear error
  clearError: () => {
    walletStore.update(state => ({ ...state, error: undefined }))
  }
}

// Helper functions (from chains.ts, re-exported for compatibility)
export const getSupportedChainIds = () => [...SUPPORTED_CHAIN_IDS]
export const isChainSupported = isChainSupportedFromChains
export const getChainName = getChainNameFromChains
export const getChainInfo = getChainInfoFromChains