<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		menu: Snippet;
	}

	let { menu }: Props = $props();

	let open = $state(false);
	let buttonEl: HTMLButtonElement;
	let menuStyle = $state('');

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	function openMenu(e: MouseEvent) {
		e.stopPropagation();
		if (!open) {
			const rect = buttonEl.getBoundingClientRect();
			menuStyle = `top:${rect.bottom + 4}px;right:${window.innerWidth - rect.right}px`;
		}
		open = !open;
	}

	function onwindowpointerdown(e: PointerEvent) {
		if (open && !buttonEl?.contains(e.target as Node)) open = false;
	}

	function onwindowscroll() {
		if (open) open = false;
	}
</script>

<svelte:window onpointerdown={onwindowpointerdown} onscroll={onwindowscroll} />

<td class="col-actions">
	<button
		bind:this={buttonEl}
		class="row-action"
		onclick={openMenu}
		aria-label="Actions"
		aria-haspopup="menu"
		aria-expanded={open}
	>
		<Icon name="more" size={14} />
	</button>
	{#if open}
		<div
			use:portal
			class="menu"
			role="menu"
			style="position:fixed;min-width:160px;z-index:200;{menuStyle}"
			onclick={() => (open = false)}
		>
			{@render menu()}
		</div>
	{/if}
</td>
