<script lang="ts">
	import type { Snippet } from 'svelte';
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		label: string;
		hint?: string;
		value: string;
		onValueChange: (e: { value: string }) => void;
		options: Array<string>;
		contents: Snippet<[string]>;
	}

	let { label, hint, value, onValueChange, options, contents }: Props = $props();

	let open = $state(false);
	let triggerEl: HTMLButtonElement;
	let floatingEl: HTMLDivElement;

	async function reposition() {
		if (!triggerEl || !floatingEl) return;
		const { x, y } = await computePosition(triggerEl, floatingEl, {
			strategy: 'fixed',
			placement: 'bottom-start',
			middleware: [
				offset(4),
				flip(),
				shift({ padding: 8 }),
				// Match the trigger's width
				{
					name: 'sameWidth',
					async fn({ rects, elements }) {
						elements.floating.style.width = `${rects.reference.width}px`;
						return {};
					}
				}
			]
		});
		Object.assign(floatingEl.style, { left: `${x}px`, top: `${y}px` });
	}

	function toggle() {
		open = !open;
	}

	function select(o: string) {
		onValueChange({ value: o });
		open = false;
	}

	function onwindowkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}

	function onwindowpointerdown(e: PointerEvent) {
		if (!open) return;
		const target = e.target as Node;
		if (!triggerEl?.contains(target) && !floatingEl?.contains(target)) {
			open = false;
		}
	}

	$effect(() => {
		if (open) reposition();
	});
</script>

<svelte:window onkeydown={onwindowkeydown} onpointerdown={onwindowpointerdown} />

<div class="form-row">
	<div class="form-row__left">
		<div class="form-row__title">{label}</div>
		{#if hint}<p class="form-row__hint">{hint}</p>{/if}
	</div>
	<div class="form-row__control">
		<button
			type="button"
			class="rich-select__trigger"
			class:rich-select__trigger--open={open}
			bind:this={triggerEl}
			onclick={toggle}
			aria-haspopup="listbox"
			aria-expanded={open}
		>
			<span class="rich-select__value">
				{@render contents(value)}
			</span>
			<Icon name="chevronDown" size={16} class="rich-select__chevron" />
		</button>
	</div>
</div>

{#if open}
	<div
		bind:this={floatingEl}
		class="menu rich-select__menu"
		role="listbox"
		style="position: fixed; z-index: 200;"
	>
		{#each options as o}
			<button
				type="button"
				class="menu__item rich-select__option"
				class:rich-select__option--selected={o === value}
				role="option"
				aria-selected={o === value}
				onclick={() => select(o)}
			>
				{@render contents(o)}
			</button>
		{/each}
	</div>
{/if}

<style>
	.form-row__left {
		padding-top: 2px;
	}

	.rich-select__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		width: 100%;
		min-height: 36px;
		padding: 6px 10px;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-inset);
		color: var(--text-1);
		text-align: left;
		transition: border-color 120ms var(--ease);
	}

	.rich-select__trigger:hover {
		border-color: var(--line-strong);
	}

	.rich-select__trigger--open {
		border-color: color-mix(in oklch, var(--accent) 60%, var(--line));
		box-shadow:
			0 0 0 3px var(--accent-glow),
			var(--shadow-inset);
	}

	.rich-select__value {
		flex: 1;
		min-width: 0;
	}

	:global(.rich-select__chevron) {
		flex-shrink: 0;
		color: var(--text-3);
		transition: transform 200ms var(--ease);
	}

	.rich-select__trigger--open :global(.rich-select__chevron) {
		transform: rotate(180deg);
	}

	:global(.rich-select__menu) {
		max-height: 320px;
		overflow-y: auto;
	}

	:global(.rich-select__option) {
		width: 100%;
		text-align: left;
	}

	:global(.rich-select__option--selected) {
		background: color-mix(in oklch, var(--accent) 10%, transparent);
		color: var(--accent);
	}
</style>
