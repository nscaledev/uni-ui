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
