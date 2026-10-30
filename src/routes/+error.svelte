<script lang="ts">
	import { page } from '$app/state';

	import ErrorPage from '#lib/layouts/ErrorPage.svelte';
</script>

<ErrorPage error={page.status.toString()} message={page.error?.message} />
