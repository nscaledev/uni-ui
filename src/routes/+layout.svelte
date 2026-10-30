<script lang="ts">
	/* Required for styling */
	import '../app.css';
	import { PUBLIC_FAVICON, PUBLIC_TITLE } from '$app/env/public';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>{PUBLIC_TITLE}</title>
	{#if PUBLIC_FAVICON}
		<link rel="icon" href={PUBLIC_FAVICON} type="image/svg+xml" />
	{/if}
</svelte:head>

{@render children?.()}
