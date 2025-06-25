<script lang="ts">
	/* Required for styling */
	import '../app.css';
	import { env } from '$env/dynamic/public';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>{env.PUBLIC_TITLE}</title>
	{#if env.PUBLIC_FAVICON}
		<link rel="shortcut icon" href={env.PUBLIC_FAVICON} />
	{/if}
	<script src="/js/iconify-icon-1.0.5.min.js"></script>
</svelte:head>

{@render children?.()}
