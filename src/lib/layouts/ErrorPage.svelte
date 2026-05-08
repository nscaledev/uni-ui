<script lang="ts">
	import Logo from '$lib/logos/Logo.svelte';

	interface Props {
		error?: string;
		message?: string;
	}

	let { error = 'unknown', message = 'unknown' }: Props = $props();
</script>

<div class="error-page">
	<div class="error-card">
		<Logo class="error-logo" />
		<p class="error-heading">Oops, we encountered an error!</p>
		<dl class="error-details">
			<dt>Status</dt>
			<dd>{error}</dd>
			<dt>Message</dt>
			<dd>{message}</dd>
		</dl>
	</div>
</div>

<style>
	.error-page {
		display: grid;
		place-items: center;
		width: 100%;
		min-height: 100vh;
	}

	.error-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	:global(.error-logo) {
		height: 48px;
		width: auto;
		display: block;
	}

	.error-heading {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-1);
		margin: 0;
	}

	.error-details {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 6px 16px;
		font-size: 13px;
		margin: 0;
	}

	.error-details dt {
		color: var(--text-3);
		font-weight: 500;
	}

	.error-details dd {
		margin: 0;
		color: var(--text-1);
	}
</style>
