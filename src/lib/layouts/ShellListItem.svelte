<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		main: Snippet;
		badges?: Snippet;
		trail?: Snippet;
		children?: Snippet;
	}

	let { main, badges, trail, children }: Props = $props();
</script>

<article class="list-item">
	<div class="list-item__header">
		<div class="list-item__main">
			{@render main()}
		</div>
		<div class="list-item__trail">
			{@render trail?.()}
		</div>
	</div>

	{#if badges}
		<div class="list-item__badges">
			{@render badges()}
		</div>
	{/if}

	{#if children}
		<div class="list-item__meta">
			{@render children()}
		</div>
	{/if}
</article>

<style>
	.list-item {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px 16px;
		background: var(--bg-2);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-inset);
		transition:
			border-color 120ms var(--ease),
			transform 140ms var(--ease);
	}

	.list-item:hover {
		border-color: var(--line-strong);
		transform: translateY(-1px);
	}

	.list-item__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.list-item__main {
		flex: 1;
		min-width: 0;
	}

	.list-item__trail {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.list-item__badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.list-item__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 20px;
		padding-top: 6px;
		border-top: 1px solid var(--line-weak);
	}
</style>
