<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Dialog } from 'bits-ui';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		label?: string;
		title: string;
		children?: Snippet;
		confirm: () => void;
		disabled?: boolean;
		class?: string;
	}

	let {
		icon,
		label,
		title,
		children,
		confirm,
		disabled = false,
		class: cls = ''
	}: Props = $props();

	let open = $state(false);

	function close() {
		open = false;
	}

	function confirmAndClose() {
		confirm();
		close();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(o) => {
		if (!disabled) open = o;
	}}
>
	<Dialog.Trigger class="btn {cls}" {disabled} aria-label={label ?? title}>
		<Icon name={icon} size={16} />
		{#if label}<span>{label}</span>{/if}
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay class="modal-overlay" />

		<Dialog.Content class="modal-box">
			<Dialog.Title class="modal-title">{title}</Dialog.Title>

			{#if children}
				<div class="modal-body">
					{@render children()}
				</div>
			{/if}

			<footer class="modal-footer">
				<Dialog.Close class="btn btn--ghost">Cancel</Dialog.Close>
				<button type="button" class="btn btn--primary" onclick={confirmAndClose}>Confirm</button>
			</footer>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	/* Backdrop */
	:global(.modal-overlay) {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	/* Dialog box — centered via translate */
	:global(.modal-box) {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 101;
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 90%;
		max-width: 480px;
		padding: 20px;
		background: var(--bg-1);
		border: 1px solid var(--line-strong);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-pop);
	}

	:global(.modal-title) {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-1);
		margin: 0;
	}

	:global(.modal-body) {
		font-size: 13px;
		color: var(--text-2);
		line-height: 1.55;
	}

	:global(.modal-footer) {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding-top: 4px;
	}
</style>
