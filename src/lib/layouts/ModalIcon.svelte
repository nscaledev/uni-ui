<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		icon: string;
		label?: string;
		title: string;
		children?: Snippet;
		confirm: () => void;
		disabled?: boolean;
		[key: string]: any;
	}

	let { icon, label, title, children, confirm, disabled = false, ...props }: Props = $props();

	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	let open = $state(false);

	function close() {
		open = false;
	}

	function confirmAndClose() {
		confirm();
		close();
	}
</script>

<Modal
	{open}
	onOpenChange={(e) => {
		if (!disabled) open = e.open;
	}}
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
	triggerBase="btn flex items-center p-0 {disabled ? 'disabled' : ''} {props.class || ''}"
>
	{#snippet trigger()}
		<Icon name={icon} size={22} />
		{#if label}
			{label}
		{/if}
	{/snippet}

	{#snippet content()}
		<header class="h2">
			{title}
		</header>

		<main>
			{@render children?.()}
		</main>

		<footer class="flex justify-between">
			<button type="button" class="btn preset-tonal" onclick={close}>Cancel</button>
			<button type="button" class="btn preset-filled" onclick={confirmAndClose}>Confirm</button>
		</footer>
	{/snippet}
</Modal>
