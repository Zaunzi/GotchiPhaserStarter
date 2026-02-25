/**
 * Chain IDs and metadata. Kept separate from @reown/appkit so this file
 * is safe to import during SSR (no wallet/Node-incompatible deps).
 */
export const BASE_MAINNET_ID = 8453
export const BASE_SEPOLIA_ID = 84532

export const SUPPORTED_CHAIN_IDS = [BASE_MAINNET_ID] as const

import type { ChainInfo } from '../../app.d.ts'

export const CHAIN_INFO: Record<number, ChainInfo> = {
  [BASE_MAINNET_ID]: {
    name: 'Base',
    symbol: 'ETH',
    decimals: 18,
    explorer: 'https://basescan.org'
  }
}

export function getChainName(chainId: number): string {
  return CHAIN_INFO[chainId]?.name ?? 'Unknown'
}

export function getChainInfo(chainId: number): ChainInfo {
  return (
    CHAIN_INFO[chainId] ?? {
      name: 'Unknown',
      symbol: 'ETH',
      decimals: 18,
      explorer: ''
    }
  )
}

export function isChainSupported(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number])
}
