<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		main: Snippet;
		badges?: Snippet;
		trail?: Snippet;
		children?: Snippet;
	}

	let { main, badges, trail, children }: Props = $props();
</script>

<article
	class="flex flex-col gap-4 lg:gap-[unset] lg:col-span-full lg:grid lg:grid-cols-subgrid lg:auto-rows-min card shadow-md p-4 bg-surface-50-950 border border-surface-200-800"
>
	<div class="contents lg:col-span-full lg:flex lg:pb-4 justify-between">
		{#if badges}
			{@render badges()}
		{/if}
		<div class="hidden lg:flex gap-4">
			{@render trail?.()}
		</div>
	</div>

	<div class="flex gap-4 lg:pr-4">
		<div class="overflow-hidden text-ellipsis">
			{@render main()}
		</div>
	</div>

	<div
		class="grid grid-cols-[repeat(3,max-content)] gap-2 lg:col-span-6 lg:grid-cols-subgrid lg:grid-rows-2 lg:grid-flow-col lg:place-self-start"
	>
		{@render children?.()}
	</div>

	<div class="flex flex-col items-start gap-4 flex-wrap lg:hidden">
		{@render trail?.()}
	</div>
</article>
