<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		disabled?: boolean;
		clicked: () => void;
		class?: string;
	}

	let { icon, disabled = $bindable(false), clicked, class: cls = '' }: Props = $props();
</script>

<button class="btn btn--icon {cls}" {disabled} onclick={clicked}>
	<Icon name={icon} size={16} />
</button>
