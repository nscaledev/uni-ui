<script lang="ts">
	import { page } from '$app/state';

	import ErrorPage from '#lib/layouts/ErrorPage.svelte';
</script>

<ErrorPage
	error={page.url.searchParams.get('error') || undefined}
	message={page.url.searchParams.get('message') || undefined}
/>
