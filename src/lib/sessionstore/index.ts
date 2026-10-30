import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

// sessionStorage wraps a Svelte store and persists the value in session storage.
// The initial value comes from session storage.
export function sessionstore<T>(key: string) {
	function initial(): T | undefined {
		if (browser) {
			const value = window.sessionStorage.getItem(key);
			if (value) {
				return JSON.parse(value) as T;
			}
		}

		return undefined;
	}

	const store = writable<T>(initial());

	function set(v: T) {
		if (browser) window.sessionStorage.setItem(key, JSON.stringify(v));
		store.set(v);
	}

	// NOTE: clear removes the session variable from storage, but it doesn't
	// (actually cannot, in a generic way) return the underlying writable store
	// to an undefined state, so if this needs to happen, then you need to
	// refresh the page to clear the store.
	function clear() {
		if (browser) window.sessionStorage.removeItem(key);
	}

	return {
		subscribe: store.subscribe,
		set: set,
		clear: clear
	};
}
