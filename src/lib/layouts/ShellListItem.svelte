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

<article class="rcard">
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
</style>
