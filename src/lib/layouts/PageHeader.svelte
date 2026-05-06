<script lang="ts">
	import type { Snippet } from 'svelte';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		breadcrumb: Array<BreadcrumbItem>;
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { breadcrumb, title, description, actions }: Props = $props();
</script>

<nav class="breadcrumb" aria-label="Breadcrumb">
	{#each breadcrumb as item, i}
		{#if i > 0}<span class="sep">/</span>{/if}
		{#if item.href}
			<a href={item.href}>{item.label}</a>
		{:else}
			<span>{item.label}</span>
		{/if}
	{/each}
</nav>

<div class="page-head">
	<div>
		<h1>{title}</h1>
		{#if description}<div class="sub">{description}</div>{/if}
	</div>
	{#if actions}
		<div class="actions">{@render actions()}</div>
	{/if}
</div>
