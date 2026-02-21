import { browser } from '$app/environment'

/** AppKit modal instance; set after initAppKit() runs in the browser. */
let modal: Awaited<ReturnType<typeof createModal>> | undefined = undefined

async function createModal() {
  const { createAppKit } = await import('@reown/appkit')
  const { EthersAdapter } = await import('@reown/appkit-adapter-ethers')
  const { base, baseSepolia } = await import('@reown/appkit/networks')

  const projectId = import.meta.env.VITE_PROJECT_ID
  if (!projectId) {
    throw new Error('VITE_PROJECT_ID is not set. Please set it in your .env file')
  }

  const ethersAdapter = new EthersAdapter()
  return createAppKit({
    adapters: [ethersAdapter],
    networks: [base, baseSepolia],
    defaultNetwork: baseSepolia,
    projectId,
    features: {
      email: false,
      socials: ['google', 'x', 'discord', 'github'],
      analytics: true,
      onramp: true
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#66e985',
      '--w3m-border-radius-master': '8px'
    },
    metadata: {
      name: 'Web3 DApp Template',
      description: 'A SvelteKit template for building Web3 dApps with Reown AppKit and Ethers',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://www.sks3.lol/',
      icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
    }
  })
}

/**
 * Initialize AppKit in the browser. Safe to call multiple times (idempotent).
 * Call this from the client layout so the modal is ready before any wallet UI runs.
 */
export async function initAppKit(): Promise<typeof modal> {
  if (!browser) return undefined
  if (modal) return modal
  modal = await createModal()
  return modal
}

export { modal }
