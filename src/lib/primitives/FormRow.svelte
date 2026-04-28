<script lang="ts">
	// FormRow: the standard create-form two-column layout.
	// Left column (260px): label + hint. Right column (1fr): control.
	interface Props {
		label: string;
		hint?: string;
		required?: boolean;
		children?: import('svelte').Snippet;
	}

	let { label, hint, required = false, children }: Props = $props();
</script>

<div class="form-row">
	<div class="form-row__title">
		{label}{#if required}<span class="req">*</span>{/if}
		{#if hint}<div class="form-row__hint">{hint}</div>{/if}
	</div>
	<div class="form-row__control">
		{@render children?.()}
	</div>
</div>
