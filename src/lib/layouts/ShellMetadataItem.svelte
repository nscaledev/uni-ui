<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		label: string;
		value: string;
	}

	let { icon, label, value }: Props = $props();
</script>

<div class="meta-item">
	<Icon name={icon} size={14} />
	<span class="meta-item__label">{label}</span>
	<span class="meta-item__value">{value}</span>
</div>

<style>
	.meta-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--text-3);
	}

	.meta-item__label {
		font-weight: 500;
		color: var(--text-3);
	}

	.meta-item__value {
		color: var(--text-2);
	}
</style>
