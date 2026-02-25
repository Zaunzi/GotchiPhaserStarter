import { ethers } from 'ethers';
import { getProvider } from './web3';
import { CONTRACT_ADDRESSES, COMMON_ABIS } from '$lib/config/contracts';
import { BASE_MAINNET_ID } from '$lib/config/chains';

const BASE_PUBLIC_RPC = 'https://mainnet.base.org';

export function getAavegotchiContract(): ethers.Contract | null {
	let provider: ethers.Provider | null = getProvider();

	if (!provider) {
		try {
			provider = new ethers.JsonRpcProvider(BASE_PUBLIC_RPC);
		} catch (error) {
			console.error('Failed to create public RPC provider:', error);
			return null;
		}
	}

	try {
		const address = CONTRACT_ADDRESSES.AAVEGOTCHI[BASE_MAINNET_ID];
		if (!address) return null;

		return new ethers.Contract(address, COMMON_ABIS.AAVEGOTCHI, provider);
	} catch (error) {
		console.error('Failed to create Aavegotchi contract:', error);
		return null;
	}
}

export async function getTokenIdsOfOwner(owner: string): Promise<number[]> {
	const contract = getAavegotchiContract();
	if (!contract) return [];

	try {
		const tokenIds = await contract.tokenIdsOfOwner(owner);
		return tokenIds.map((id: bigint) => Number(id));
	} catch (error) {
		console.error(`Failed to fetch Aavegotchi tokenIds for owner ${owner}:`, error);
		return [];
	}
}
