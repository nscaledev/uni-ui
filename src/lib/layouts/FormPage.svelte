<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/forms/Button.svelte';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		// Breadcrumb trail — last item is the current page (no href needed).
		breadcrumb: Array<BreadcrumbItem>;
		// Cancel navigates here.
		cancelHref: string;
		// Submit label shown on the primary action button.
		submitLabel?: string;
		// Called when the primary action button is clicked.
		onSubmit: () => void;
		// Whether the form is valid enough to submit.
		valid?: boolean;
		// Whether a submission is in progress (disables the button).
		submitting?: boolean;
		// The form sections (left column).
		form: Snippet;
		// Optional sticky summary panel (right column).
		summary?: Snippet;
	}

	let {
		breadcrumb,
		cancelHref,
		submitLabel = 'Create',
		onSubmit,
		valid = false,
		submitting = false,
		form,
		summary
	}: Props = $props();
</script>

<!-- Breadcrumb -->
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

<!-- Form layout -->
<div class="form-layout" class:form-layout--no-aside={!summary}>
	<div class="form-main">
		{@render form()}
	</div>

	{#if summary}
		<aside class="form-side">
			<div class="form-section">
				<header><div class="form-section__title">Summary</div></header>
				{@render summary()}
			</div>
		</aside>
	{/if}
</div>

<!-- Sticky footer -->
<div class="form-footer">
	<Button icon="x" label="Cancel" href={cancelHref} />
	<div style="flex:1"></div>
	<Button
		icon="check"
		label={submitting ? 'Saving…' : submitLabel}
		class="btn--primary"
		clicked={onSubmit}
		disabled={!valid || submitting}
	/>
</div>

<style>
	.form-layout--no-aside {
		grid-template-columns: 1fr !important;
		max-width: 680px;
	}
</style>
