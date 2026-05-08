<script lang="ts">
	import * as Compute from '$lib/openapi/compute';

	interface Props {
		image?: Compute.Image;
		selector?: Compute.ImageSelector;
	}

	let { image, selector }: Props = $props();

	let distro = $derived(image?.spec.os.distro || selector?.distro);
	let variant = $derived(image?.spec.os.variant || selector?.variant);
	let version = $derived(image?.spec.os.version || selector?.version);

	function toTitleCase(word: string): string {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}

	let label = $derived.by(() => {
		if (!distro || !version) return null;
		const parts = [toTitleCase(distro)];
		if (variant) parts.push(toTitleCase(variant));
		parts.push(version);
		return parts.join(' ');
	});
</script>

{#if label}
	<span class="image-label">{label}</span>
{/if}

<style>
	.image-label {
		font-size: 12px;
		color: var(--text-1);
	}
</style>
