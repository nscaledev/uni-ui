<script lang="ts">
	import type * as Kubernetes from '$lib/openapi/kubernetes';

	interface Props {
		title?: string;
		metadata?: Kubernetes.ResourceReadMetadata;
		href?: string;
	}

	let { title, metadata, href }: Props = $props();

	const name = $derived(title ?? metadata?.name ?? '');
</script>

{#snippet content()}
	<div class="rcard__name">{name}</div>
	{#if metadata?.id}
		<div class="rcard__id">{metadata.id}</div>
	{/if}
	{#if metadata?.description}
		<div class="rcard__desc">{metadata.description}</div>
	{/if}
{/snippet}

{#if href}
	<a {href} class="card-name-link">
		{@render content()}
	</a>
{:else}
	{@render content()}
{/if}

<style>
	.card-name-link {
		text-decoration: none;
		color: inherit;
	}

	.card-name-link:hover :global(.rcard__name) {
		color: var(--accent);
	}

	:global(.rcard__desc) {
		font-size: 12px;
		color: var(--text-3);
		font-style: italic;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 2px;
	}
</style>
