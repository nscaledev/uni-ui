<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/forms/Button.svelte';
	import PageHeader from '$lib/layouts/PageHeader.svelte';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		breadcrumb: Array<BreadcrumbItem>;
		cancelHref: string;
		submitLabel?: string;
		description: string;
		onSubmit: () => void;
		valid?: boolean;
		submitting?: boolean;
		form: Snippet;
		summary?: Snippet;
	}

	let {
		breadcrumb,
		cancelHref,
		submitLabel = 'Create',
		description,
		onSubmit,
		valid = false,
		submitting = false,
		form,
		summary
	}: Props = $props();
</script>

<PageHeader {breadcrumb} title={submitLabel} {description} />

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

	/* Override design.css 248px with our actual sidebar width */
	.form-footer {
		left: 240px;
	}
</style>
