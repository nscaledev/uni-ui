<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		// Status variant — drives colour of dot and text.
		variant?: 'ok' | 'warn' | 'err' | 'info' | 'muted';
		// Show the coloured dot before the content.
		dot?: boolean;
		children?: Snippet;
	}

	let { variant, dot = false, children }: Props = $props();
</script>

<span
	class="chip"
	class:chip--ok={variant === 'ok'}
	class:chip--warn={variant === 'warn'}
	class:chip--err={variant === 'err'}
	class:chip--info={variant === 'info'}
	class:chip--muted={variant === 'muted' || !variant}
>
	{#if dot}<span class="dot"></span>{/if}
	{@render children?.()}
</span>
