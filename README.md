# Gotchi Phaser Starter

A template for building **Aavegotchi games** with **Phaser** and the **[gotchi.lol](https://gotchi.lol) API**. Uses SvelteKit for the app shell, Reown AppKit for wallet connection, and Phaser for 2D game rendering—with Aavegotchi sprites and data supplied by gotchi.lol.

## What’s in the template

- 🎮 **Phaser 3** – 2D game engine for Aavegotchi game logic and rendering
- 👻 **gotchi.lol API** – Fetch and display Aavegotchi sprites and data (e.g. `https://gotchi.lol/api/gotchi-sprites/{tokenId}`)
- 🔗 **Wallet integration** – Reown AppKit for connecting wallets and using Aavegotchis from the user’s wallet
- 🌐 **Base** – Configured for Base Sepolia (testnet) and Base mainnet
- 🎨 **Skeleton UI** – UI and theme (dark/light) for menus and non-Phaser screens
- 📱 **Responsive** – SvelteKit + Tailwind for layout; Phaser canvas scales as needed
- 🔧 **TypeScript** – Full TypeScript across Svelte and game code

## Getting started

### Prerequisites

- **Node.js** 20.19.0+ or 22.12.0+ (see `.nvmrc`; [nvm](https://github.com/nvm-sh/nvm) recommended)
- **pnpm** (recommended)

```bash
# Install pnpm
npm install -g pnpm
```

### Setup

1. **Clone and enter the repo**
   ```bash
   git clone <your-repo-url>
   cd GotchiPhaserStarter
   ```

2. **Use the correct Node version**
   ```bash
   nvm use
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Environment**
   ```bash
   cp env.example .env
   ```
   Add your [Reown Cloud](https://cloud.reown.com/) project ID to `.env`:
   ```
   VITE_PROJECT_ID=your_project_id_here
   ```

5. **Run the dev server**
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

## Using the gotchi.lol API

The [gotchi.lol](https://gotchi.lol) API provides Aavegotchi sprites and related data for use in your Phaser game.

- **Sprite sheet (PNG)**  
  `GET https://gotchi.lol/api/gotchi-sprites/{tokenId}`  
  Returns the full sprite sheet for the given Aavegotchi `tokenId`. Use this URL as the image source when loading sprites in Phaser (e.g. preload, then slice by frame size and row for idle, sprint, attack, etc.).

- **Frame layout**  
  Sheets are row-based; row indices and frame counts match common Aavegotchi stances (e.g. idle, sprint, wand/throw, melee, hurt, death). Use the same frame dimensions and row layout as gotchi.lol so your Phaser animations line up.

- **Data**  
  For names, traits, or other on-chain/API data, use the same token IDs with your preferred Aavegotchi/Subgraph or backend API; this template focuses on **Phaser + gotchi.lol sprites** for the game view.

In this repo, Phaser scenes can load a gotchi sprite URL for a given `tokenId` and then animate by row/frame according to your game’s state (idle, moving, attacking, etc.).

## Project structure (relevant to games)

```
src/
├── lib/
│   ├── components/     # Svelte UI (navbar, wallet, etc.)
│   ├── config/        # AppKit, contracts
│   ├── stores/        # Wallet/network state
│   └── ...
├── routes/            # SvelteKit pages
│   ├── +layout.svelte
│   └── +page.svelte   # Entry; mount Phaser or link to game route
└── ...
```

- **Phaser**: Add or extend scenes under a dedicated folder (e.g. `src/lib/phaser/` or `src/lib/game/`), then create a game config and mount the canvas in a Svelte component or route.
- **Sprites**: In Phaser, preload the gotchi.lol sprite URL for a token ID, then use frame dimensions and row layout to build animations (idle, move, attack, etc.).

## Scripts

- `pnpm run dev` – Development server
- `pnpm run build` – Production build
- `pnpm run preview` – Preview production build
- `pnpm run check` – TypeScript/svelte-check

## Networks

- **Base Sepolia** (84532) – Testnet  
- **Base** (8453) – Mainnet  

Wallet and chain config live in `src/lib/config/appkit.ts`; use the same chain as your Aavegotchi contracts and gotchi.lol.

## Learn more

- [gotchi.lol](https://gotchi.lol) – Aavegotchi sprite API
- [Phaser 3](https://phaser.io/) – Game engine
- [Aavegotchi](https://aavegotchi.com/) – NFT game
- [SvelteKit](https://kit.svelte.dev/docs)
- [Reown AppKit](https://docs.reown.com/appkit)
- [Base](https://docs.base.org/)

## License

MIT. Use this template to build your own Aavegotchi games with Phaser and the gotchi.lol API.
