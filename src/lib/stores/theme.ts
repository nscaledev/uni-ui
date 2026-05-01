import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Appearance = 'light' | 'dim' | 'dark';
export type Surface = 'solid' | 'glass';
export type View = 'table' | 'cards' | 'grouped';

function persisted<T extends string>(key: string, fallback: T) {
	const initial: T = browser ? ((localStorage.getItem(key) as T) ?? fallback) : fallback;
	const store = writable<T>(initial);

	if (browser) {
		store.subscribe((value) => localStorage.setItem(key, value));
	}

	return store;
}

export const appearance = persisted<Appearance>('uk:appearance', 'light');
export const surface = persisted<Surface>('uk:surface', 'solid');
export const view = persisted<View>('uk:view', 'cards');

// Not persisted — panel is closed by default on every load.
export const tweaksOpen = writable(false);
