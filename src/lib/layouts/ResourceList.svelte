<script lang="ts">
	import type { Snippet } from 'svelte';

	import Button from '$lib/forms/Button.svelte';
	import ButtonIcon from '$lib/forms/ButtonIcon.svelte';

	interface Props {
		// Title of the resource list.
		title: string;
		// Class to apply to the title.
		titleClass?: string;
		// Description of what the list represents.
		description?: Snippet;
		// Number of columns to render per list item.
		columns: number;
		// Items in the list.
		items: Array<any>;
		// Initial item to have expanded.
		initialItem?: number;
		// Normal list element renderer e.g. a summary.
		normal: Snippet<[any, number]>;
		// Expanded list element renderer e.g. an update dialog.
		expanded: Snippet<[any, number]>;
		// Whether or not any item is expanded.
		active: boolean;
		// Whether the expanded item is valid.
		valid?: boolean;
		// Called when a new element wants to be added, as we cannot guarantee
		// where the item will be inserted, this returns the new index.
		add: () => number;
		// Remove is called when an active item is deleted.
		remove: (index: number) => void;
		// Called when an item is activated.
		activate?: (index: number) => void;
		// Called when an item is deactivated.
		deactivate?: (index: number) => void;
	}

	let {
		title,
		titleClass = 'h2',
		description,
		columns,
		items,
		initialItem,
		normal,
		expanded,
		active = $bindable(false),
		valid = true,
		add,
		remove,
		activate,
		deactivate
	}: Props = $props();

	let activeItem: number | null = $state(null);

	// If the initial item is set, then update the active item accordingly,
	// but as a singleton.
	let activeItemInit = false;

	$effect.pre(() => {
		if (activeItemInit) return;

		activeItemInit = true;

		if (initialItem != null && initialItem >= 0 && initialItem < items.length) {
			itemActivate(initialItem);
		}
	});

	// Informa the client that an item is active when an active item index is selected.
	$effect.pre(() => {
		active = activeItem != null;
	});

	function itemActivate(index: number) {
		activeItem = index;
		activate?.(index);
	}

	function itemDeactivate(index: number) {
		activeItem = null;
		deactivate?.(index);
	}

	function itemAdd() {
		itemActivate(add());
	}

	function itemRemove(index: number) {
		itemDeactivate(index);
		remove(index);
	}

	let style = $derived('grid-template-columns:' + ' max-content'.repeat(columns) + ' 1fr;');
</script>

<div class="rl-header">
	<div class={titleClass}>{title}</div>
	<Button icon="plus" label="Add" clicked={itemAdd} disabled={active} />
</div>

{@render description?.()}

<div class="rl-list" {style}>
	{#each items as item, index}
		{#if activeItem == index}
			<div class="rl-item rl-item--expanded col-span-full">
				{@render expanded(item, index)}

				<div class="rl-item__actions">
					<Button
						icon="trash"
						label="Delete"
						class="btn--danger"
						clicked={() => itemRemove(index)}
					/>
					<Button
						icon="check"
						label="Update"
						class="btn--primary"
						clicked={() => itemDeactivate(index)}
						disabled={!valid}
					/>
				</div>
			</div>
		{:else}
			<div class="rl-item col-span-full">
				<div class="rl-item__content">
					{@render normal(item, index)}
				</div>

				<div class="rl-item__controls">
					<ButtonIcon icon="edit" clicked={() => itemActivate(index)} disabled={active} />
					<ButtonIcon icon="trash" clicked={() => itemRemove(index)} disabled={active} />
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.rl-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.rl-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.rl-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: var(--bg-2);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-inset);
	}

	.rl-item--expanded {
		flex-direction: column;
		align-items: stretch;
		gap: 16px;
		background: var(--bg-1);
		border-color: color-mix(in oklch, var(--accent) 40%, var(--line));
	}

	.rl-item__content {
		flex: 1;
		min-width: 0;
		display: contents;
	}

	.rl-item__controls {
		display: flex;
		gap: 6px;
		margin-left: auto;
		flex-shrink: 0;
	}

	.rl-item__actions {
		display: flex;
		justify-content: space-between;
		padding-top: 4px;
		border-top: 1px solid var(--line-weak);
	}
</style>
