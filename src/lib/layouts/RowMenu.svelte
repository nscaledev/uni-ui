<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		menu: Snippet;
	}

	let { menu }: Props = $props();

	let open = $state(false);
	let wrapEl: HTMLElement;

	function onwindowpointerdown(e: PointerEvent) {
		if (open && !wrapEl?.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onpointerdown={onwindowpointerdown} />

<td class="col-actions">
	<div class="row-menu-wrap" bind:this={wrapEl}>
		<button
			class="row-action"
			onclick={(e) => {
				e.stopPropagation();
				open = !open;
			}}
			aria-label="Actions"
			aria-haspopup="menu"
			aria-expanded={open}
		>
			<Icon name="more" size={14} />
		</button>
		{#if open}
			<div class="menu row-menu" role="menu" onclick={() => (open = false)}>
				{@render menu()}
			</div>
		{/if}
	</div>
</td>

<style>
	.row-menu-wrap {
		position: relative;
		display: inline-flex;
		justify-content: flex-end;
		width: 100%;
	}

	.row-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		min-width: 160px;
		z-index: 40;
	}
</style>
