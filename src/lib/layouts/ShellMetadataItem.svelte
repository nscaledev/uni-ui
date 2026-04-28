<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		label: string;
		value: string;
	}

	let { icon, label, value }: Props = $props();
</script>

<div class="col-span-3 grid grid-cols-subgrid items-center text-sm">
	<Icon name={icon} size={18} />

	<div class="font-bold">
		{label}
	</div>

	<div>
		{value}
	</div>
</div>
