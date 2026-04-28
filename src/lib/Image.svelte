<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';
	import * as Region from '$lib/openapi/region';
	import * as Compute from '$lib/openapi/compute';

	interface Props {
		image?: Region.Image;
		selector?: Compute.ImageSelector;
	}

	let { image, selector }: Props = $props();

	let distro = $derived(image?.spec.os.distro || selector?.distro);
	let variant = $derived(image?.spec.os.variant || selector?.variant);
	let version = $derived(image?.spec.os.version || selector?.version);
	let family = $derived(image?.spec.os.family);
	let kernel = $derived(image?.spec.os.kernel);

	function getIcon(): string {
		if (!distro) return 'mdi:question-mark';

		switch (distro) {
			case Region.OsDistro.Rocky:
				return 'logos:rocky-linux';
			case Region.OsDistro.Ubuntu:
				return 'logos:ubuntu';
		}

		switch (family) {
			case Region.OsFamily.Redhat:
				return 'logos:redhat';
			case Region.OsFamily.Debian:
				return 'logos:debian';
		}

		switch (kernel) {
			case Region.OsKernel.Linux:
				return 'logos:linux';
		}

		return 'mdi:question-mark';
	}

	function toTitleCase(word: string): string {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}
</script>

{#if distro && version}
	<div class="flex items-center gap-2">
		<Icon name="" size={20} class="pr-1 text-2xl" />

		{toTitleCase(distro)}

		{#if variant}
			{toTitleCase(variant)}
		{/if}

		{version}
	</div>
{/if}
