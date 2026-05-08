<script lang="ts">
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Option {
		id: string;
		label: string;
		// Coloured pip shown in the dropdown and (when active) in the chip.
		color?: string;
		// Prefix rendered before the label in the dropdown (e.g. flag emoji).
		prefix?: string;
	}

	interface Props {
		// Icon name shown inside the chip button.
		icon?: string;
		label: string;
		options: Array<Option>;
		selected: Set<string>;
		onchange: (next: Set<string>) => void;
	}

	let { icon, label, options, selected, onchange }: Props = $props();

	let open = $state(false);
	let triggerEl: HTMLButtonElement;
	let panelEl: HTMLDivElement;

	const activeOpts = $derived(options.filter((o) => selected.has(o.id)));

	const summary = $derived.by(() => {
		if (activeOpts.length === 0) return null;
		if (activeOpts.length === 1) return activeOpts[0].label;
		return `${activeOpts.length} selected`;
	});

	// Single active option's colour for the chip pip, if applicable.
	const activePipColor = $derived(activeOpts.length === 1 ? activeOpts[0].color : null);

	async function reposition() {
		if (!triggerEl || !panelEl) return;
		const { x, y } = await computePosition(triggerEl, panelEl, {
			placement: 'bottom-start',
			middleware: [offset(6), flip(), shift({ padding: 8 })]
		});
		Object.assign(panelEl.style, { left: `${x}px`, top: `${y}px` });
	}

	$effect(() => {
		if (open) reposition();
	});

	function onwindowpointerdown(e: PointerEvent) {
		if (!open) return;
		const t = e.target as Node;
		if (!triggerEl?.contains(t) && !panelEl?.contains(t)) open = false;
	}

	function onwindowkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}

	function toggle(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onchange(next);
	}
</script>

<svelte:window onpointerdown={onwindowpointerdown} onkeydown={onwindowkeydown} />

<button
	bind:this={triggerEl}
	class="filter-chip"
	class:active={selected.size > 0}
	onclick={() => (open = !open)}
	aria-haspopup="listbox"
	aria-expanded={open}
>
	{#if activePipColor}
		<span class="chip-pip" style="background:{activePipColor}"></span>
	{:else if icon}
		<Icon name={icon} size={13} class="chip-icon" />
	{/if}

	<span class="chip-label">{label}</span>

	{#if summary}
		<span class="chip-summary">{summary}</span>
	{/if}

	<Icon
		name="chevronDown"
		size={11}
		class={open ? 'chip-chevron chip-chevron--open' : 'chip-chevron'}
	/>
</button>

{#if open}
	<div
		bind:this={panelEl}
		class="menu filter-panel"
		role="listbox"
		aria-multiselectable="true"
		style="position:fixed;z-index:200;"
	>
		<div class="filter-panel__head">
			<span class="menu__title">{label}</span>
			{#if selected.size > 0}
				<button class="filter-panel__clear" onclick={() => onchange(new Set())}>Clear</button>
			{/if}
		</div>

		{#each options as opt}
			<button
				class="menu__item"
				class:menu__item--selected={selected.has(opt.id)}
				role="option"
				aria-selected={selected.has(opt.id)}
				onclick={() => toggle(opt.id)}
			>
				{#if opt.color}
					<span class="opt-pip" style="background:{opt.color}"></span>
				{/if}
				{#if opt.prefix}
					<span class="opt-prefix">{opt.prefix}</span>
				{/if}
				<span class="opt-label">{opt.label}</span>
				{#if selected.has(opt.id)}
					<Icon name="check" size={13} class="opt-check" />
				{/if}
			</button>
		{/each}
	</div>
{/if}

<style>
	.chip-pip {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		flex-shrink: 0;
	}

	:global(.chip-icon) {
		color: currentColor;
		opacity: 0.7;
		flex-shrink: 0;
	}

	.chip-label {
		font-size: 12px;
	}

	.chip-summary {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-1);
	}

	:global(.chip-chevron) {
		color: var(--text-4);
		transition: transform 150ms var(--ease);
		flex-shrink: 0;
	}

	:global(.chip-chevron--open) {
		transform: rotate(180deg);
	}

	.filter-panel {
		min-width: 200px;
		padding: 4px;
	}

	.filter-panel__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px 2px;
	}

	.filter-panel__clear {
		font-size: 11px;
		color: var(--accent);
		font-weight: 500;
	}

	.filter-panel__clear:hover {
		color: var(--text-1);
	}

	.menu__item--selected {
		color: var(--text-1);
		background: var(--bg-2);
	}

	.opt-pip {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		flex-shrink: 0;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
	}

	.opt-prefix {
		font-size: 14px;
		line-height: 1;
		flex-shrink: 0;
	}

	.opt-label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.opt-check) {
		color: var(--accent);
		flex-shrink: 0;
		margin-left: auto;
	}
</style>
