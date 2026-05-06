import { writable } from 'svelte/store';

export type ToastLevel = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	level: ToastLevel;
	title: string;
	description?: string;
}

export interface ToastOptions {
	title: string;
	description?: string;
	// Duration in ms; 0 = persist until manually closed.
	duration?: number;
}

export const toastsStore = writable<Array<Toast>>([]);

function add(level: ToastLevel, opts: ToastOptions) {
	const id = crypto.randomUUID();
	toastsStore.update((t) => [
		...t,
		{ id, level, title: opts.title, description: opts.description }
	]);

	const duration = opts.duration ?? 6000;
	if (duration > 0) {
		setTimeout(() => remove(id), duration);
	}
}

function remove(id: string) {
	toastsStore.update((t) => t.filter((x) => x.id !== id));
}

export const toaster = {
	error: (opts: ToastOptions) => add('error', opts),
	success: (opts: ToastOptions) => add('success', opts),
	info: (opts: ToastOptions) => add('info', opts),
	remove
};
