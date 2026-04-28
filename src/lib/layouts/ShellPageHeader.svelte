<script lang="ts">
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		settings: ShellPageSettings;
		tools?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { settings, tools, children }: Props = $props();
</script>

<div class="flex flex-col gap-4 lg:flex-row lg:jusify-between">
	<div class="flex gap-4 grow">
		<div class="flex flex-col gap-4">
			<div class="flex gap-4 items-center">
				{#if settings.icon}
					<Icon name={settings.icon} size={48} />
				{/if}
				<h1 class="text-3xl lg:text-5xl">{settings.name}</h1>
			</div>
			<p class="text-surface-700-300">{settings.description}</p>
		</div>
	</div>

	<div class="self-start lg:self-end flex gap-4">
		{@render tools?.()}
	</div>
</div>
