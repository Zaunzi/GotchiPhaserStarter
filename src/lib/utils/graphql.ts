import { browser } from '$app/environment';

const CORE_SUBGRAPH_URL =
	'https://api.goldsky.com/api/public/project_cmh3flagm0001r4p25foufjtt/subgraphs/aavegotchi-core-base/prod/gn';

export interface GraphQLResponse<T> {
	data?: T;
	errors?: Array<{ message: string }>;
}

async function query<T>(queryString: string, variables?: Record<string, unknown>): Promise<T> {
	if (!browser) {
		throw new Error('GraphQL queries can only be executed in the browser');
	}

	try {
		const response = await fetch(CORE_SUBGRAPH_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: queryString, variables })
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result: GraphQLResponse<T> = await response.json();

		if (result.errors) {
			throw new Error(`GraphQL Error: ${result.errors.map((e) => e.message).join(', ')}`);
		}

		if (!result.data) {
			throw new Error('No data returned from GraphQL query');
		}

		return result.data;
	} catch (error) {
		console.error('GraphQL query error:', error);
		throw error;
	}
}

export interface Aavegotchi {
	id: string;
	gotchiId: string;
	tokenId: string;
	name: string;
	nameLowerCase?: string;
	randomNumber: string;
	status: number;
	numericTraits: number[];
	modifiedNumericTraits: number[];
	equippedWearables: number[];
	owner: { id: string };
	[key: string]: unknown;
}

const GET_AAVEGOTCHI_QUERY = `
	query GetAavegotchiByTokenId($id: ID!) {
		aavegotchi(id: $id, subgraphError: allow) {
			id
			gotchiId
			name
			nameLowerCase
			randomNumber
			status
			numericTraits
			modifiedNumericTraits
			equippedWearables
			owner { id }
		}
	}
`;

export async function getAavegotchiByTokenId(tokenId: string): Promise<Aavegotchi | null> {
	try {
		const result = await query<{ aavegotchi: Record<string, unknown> | null }>(
			GET_AAVEGOTCHI_QUERY,
			{ id: tokenId }
		);
		if (result.aavegotchi) {
			const g = result.aavegotchi;
			return {
				...g,
				tokenId: (g.gotchiId ?? g.id) as string
			} as Aavegotchi;
		}
		return null;
	} catch (error) {
		console.error('Error fetching Aavegotchi by tokenId:', error);
		return null;
	}
}

export async function getAavegotchi(id: string): Promise<Aavegotchi | null> {
	return getAavegotchiByTokenId(id);
}
