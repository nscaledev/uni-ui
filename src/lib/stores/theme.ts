import { browser } from '$app/environment';

export type Appearance = 'light' | 'dim' | 'dark';
export type Surface = 'solid' | 'glass';
export type View = 'table' | 'cards' | 'grouped';

function persisted<T extends string>(key: string, fallback: T): { current: T } {
	const initial = browser ? ((localStorage.getItem(key) as T) ?? fallback) : fallback;

	const store = $state({ current: initial });

	$effect(() => {
		localStorage.setItem(key, store.current);
	});

	return store;
}

export const appearance = persisted<Appearance>('uk:appearance', 'dark');
export const surface = persisted<Surface>('uk:surface', 'solid');
export const view = persisted<View>('uk:view', 'table');

// Apply appearance and surface as data attributes on <html> so design.css
// token selectors (:root[data-appearance="..."] etc.) activate correctly.
$effect.root(() => {
	$effect(() => {
		if (!browser) return;
		document.documentElement.setAttribute('data-appearance', appearance.current);
	});

	$effect(() => {
		if (!browser) return;
		document.documentElement.setAttribute('data-surface', surface.current);
	});
});
