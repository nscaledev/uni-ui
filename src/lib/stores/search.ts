import { writable } from 'svelte/store';

export interface OmniFilter {
	key: string;
	value: string;
}

export const omniQuery = writable('');
export const omniFilters = writable<Array<OmniFilter>>([]);
