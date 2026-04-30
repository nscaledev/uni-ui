<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	interface SelectContext {
		isSelected: (id: string) => boolean;
		toggle: (id: string) => void;
	}

	interface Props {
		id?: string;
		main: Snippet;
		badges?: Snippet;
		menu?: Snippet;
		children?: Snippet;
	}

	let { id, main, badges, menu, children }: Props = $props();

	const selectCtx = getContext<SelectContext | undefined>('bulkSelect');
	const selected = $derived(id && selectCtx ? selectCtx.isSelected(id) : false);

	let menuOpen = $state(false);
	let menuWrapEl: HTMLDivElement;

	function onwindowpointerdown(e: PointerEvent) {
		if (menuOpen && !menuWrapEl?.contains(e.target as Node)) menuOpen = false;
	}
</script>

<svelte:window onpointerdown={onwindowpointerdown} />

<article class="rcard" class:selected>
	<div class="rcard__head">
		{#if id && selectCtx}
			<input
				type="checkbox"
				class="checkbox"
				checked={selected}
				onchange={() => id && selectCtx?.toggle(id)}
				aria-label="Select item"
			/>
		{/if}
		{@render badges?.()}
		{#if menu}
			<div class="card-menu-wrap" bind:this={menuWrapEl}>
				<button
					class="btn btn--ghost btn--icon btn--sm"
					onclick={(e) => {
						e.stopPropagation();
						menuOpen = !menuOpen;
					}}
					aria-label="Actions"
					aria-haspopup="menu"
					aria-expanded={menuOpen}
				>
					<Icon name="more" size={14} />
				</button>
				{#if menuOpen}
					<div class="menu card-menu" role="menu" onclick={() => (menuOpen = false)}>
						{@render menu()}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{@render main()}

	{#if children}
		<dl class="rcard__grid">
			{@render children()}
		</dl>
	{/if}
</article>

<style>
	.card-menu-wrap {
		margin-left: auto;
		position: relative;
		flex-shrink: 0;
	}

	.card-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		min-width: 160px;
		z-index: 40;
	}

	.selected {
		border-color: color-mix(in oklch, var(--accent) 40%, var(--line));
		box-shadow:
			var(--shadow-inset),
			0 0 0 2px color-mix(in oklch, var(--accent) 20%, transparent);
	}
</style>
