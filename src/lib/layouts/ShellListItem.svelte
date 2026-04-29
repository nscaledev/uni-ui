<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	interface SelectContext {
		isSelected: (id: string) => boolean;
		toggle: (id: string) => void;
	}

	interface Props {
		id?: string;
		main: Snippet;
		badges?: Snippet;
		trail?: Snippet;
		children?: Snippet;
	}

	let { id, main, badges, trail, children }: Props = $props();

	const selectCtx = getContext<SelectContext | undefined>('bulkSelect');
	const selected = $derived(id && selectCtx ? selectCtx.isSelected(id) : false);
</script>

<article class="rcard" class:selected>
	{#if id && selectCtx}
		<input
			type="checkbox"
			class="checkbox card-checkbox"
			checked={selected}
			onchange={() => id && selectCtx?.toggle(id)}
			aria-label="Select item"
		/>
	{/if}

	<div class="rcard__head">
		{@render badges?.()}
		{#if trail}
			<div class="card-trail">
				{@render trail()}
			</div>
		{/if}
	</div>

	{@render main()}

	{#if children}
		<div class="card-meta">
			{@render children()}
		</div>
	{/if}
</article>

<style>
	.card-checkbox {
		position: absolute;
		top: 12px;
		right: 12px;
	}

	.card-trail {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.card-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 16px;
		padding-top: 10px;
		border-top: 1px solid var(--line-weak);
	}

	.selected {
		border-color: color-mix(in oklch, var(--accent) 40%, var(--line));
		box-shadow:
			var(--shadow-inset),
			0 0 0 2px color-mix(in oklch, var(--accent) 20%, transparent);
	}
</style>
