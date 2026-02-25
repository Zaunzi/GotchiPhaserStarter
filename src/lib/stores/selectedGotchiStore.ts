import { writable } from 'svelte/store';
import type { Aavegotchi } from '$lib/utils/graphql';

export interface SelectedGotchi {
	tokenId: string;
	name?: string;
	gotchi?: Aavegotchi;
}

function createSelectedGotchiStore() {
	const { subscribe, set } = writable<SelectedGotchi | null>(null);

	return {
		subscribe,
		set: (gotchi: SelectedGotchi | null) => set(gotchi),
		clear: () => set(null)
	};
}

export const selectedGotchiStore = createSelectedGotchiStore();
