<script lang="ts">
	import type { Snippet } from 'svelte';
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		label: string;
		disabled?: boolean;
		class?: string;
		contents: Snippet<[() => void]>;
	}

	let { icon, label, disabled = $bindable(false), class: cls = '', contents }: Props = $props();

	let open = $state(false);
	let triggerEl: HTMLButtonElement;
	let floatingEl: HTMLDivElement;

	async function reposition() {
		if (!triggerEl || !floatingEl) return;
		const { x, y } = await computePosition(triggerEl, floatingEl, {
			strategy: 'fixed',
			placement: 'bottom-start',
			middleware: [offset(4), flip(), shift({ padding: 8 })]
		});
		Object.assign(floatingEl.style, { left: `${x}px`, top: `${y}px` });
	}

	$effect(() => {
		if (open) reposition();
	});

	function onwindowpointerdown(e: PointerEvent) {
		if (!open) return;
		const t = e.target as Node;
		if (!triggerEl?.contains(t) && !floatingEl?.contains(t)) open = false;
	}

	function onwindowkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onpointerdown={onwindowpointerdown} onkeydown={onwindowkeydown} />

<button
	bind:this={triggerEl}
	class="btn {cls}"
	class:btn--primary={!cls}
	{disabled}
	onclick={() => (open = !open)}
>
	<Icon name={icon} size={16} />
	{label}
</button>

{#if open}
	<div bind:this={floatingEl} class="menu popup-menu" style="position:fixed;z-index:100;">
		{@render contents(() => (open = false))}
	</div>
{/if}

<style>
	:global(.popup-menu) {
		min-width: 220px;
		padding: 12px;
	}
</style>
