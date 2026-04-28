<script lang="ts">
	import Spinner from '$lib/primitives/Spinner.svelte';
</script>

<!-- Never rendered — page.ts redirect blocks this — but kept as a fallback -->
<div class="auth-screen">
	<div class="auth-loading">
		<p class="auth-loading__label">Exchanging credentials</p>
		<Spinner />
	</div>
</div>

<style>
	.auth-screen {
		display: grid;
		place-items: center;
		min-height: 100vh;
		background: var(--bg-0);
	}

	.auth-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.auth-loading__label {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-2);
	}
</style>
