<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		name?: string;
		value: Array<string> | undefined;
		label: string;
		hint?: string;
		placeholder?: string;
	}

	let {
		name,
		value = $bindable([]),
		label,
		hint,
		placeholder = 'Type and press Enter…'
	}: Props = $props();

	let input = $state('');
	let inputEl: HTMLInputElement;

	function commit() {
		const tag = input.trim();
		if (tag && !value.includes(tag)) {
			value = [...value, tag];
		}
		input = '';
	}

	function remove(i: number) {
		value = value.filter((_, j) => j !== i);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			commit();
		} else if (e.key === 'Backspace' && input === '') {
			value = value.slice(0, -1);
		}
	}
</script>

<div class="form-row">
	<div class="form-row__left">
		<div class="form-row__title">{label}</div>
		{#if hint}<p class="form-row__hint">{hint}</p>{/if}
	</div>
	<div class="form-row__control">
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="chips-input" onclick={() => inputEl.focus()}>
			{#each value as tag, i}
				<span class="chip">
					<span class="chip__label">{tag}</span>
					<button
						type="button"
						class="chip__remove"
						aria-label="Remove {tag}"
						onclick={(e) => {
							e.stopPropagation();
							remove(i);
						}}
					>
						<Icon name="x" size={12} />
					</button>
				</span>
			{/each}

			<input
				{name}
				type="text"
				class="chips-input__text"
				{placeholder}
				bind:value={input}
				bind:this={inputEl}
				{onkeydown}
				onblur={commit}
			/>
		</div>
	</div>
</div>

<style>
	.form-row__left {
		padding-top: 2px;
	}

	.chips-input {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		min-height: 36px;
		padding: 4px 10px;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-inset);
		cursor: text;
	}

	.chips-input:focus-within {
		border-color: color-mix(in oklch, var(--accent) 60%, var(--line));
		box-shadow:
			0 0 0 3px var(--accent-glow),
			var(--shadow-inset);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 22px;
		padding: 0 6px 0 8px;
		background: var(--bg-3);
		border: 1px solid var(--line);
		border-radius: 6px;
		font-size: 12px;
		color: var(--text-1);
		white-space: nowrap;
	}

	.chip__label {
		font-family: var(--font-mono);
	}

	.chip__remove {
		display: flex;
		align-items: center;
		color: var(--text-3);
		border-radius: 3px;
		padding: 1px;
	}

	.chip__remove:hover {
		color: var(--danger);
		background: color-mix(in oklch, var(--danger) 12%, transparent);
	}

	.chips-input__text {
		flex: 1;
		min-width: 120px;
		height: 26px;
		background: transparent;
		border: 0;
		outline: 0;
		color: var(--text-1);
		font: inherit;
		font-size: 13px;
	}

	.chips-input__text::placeholder {
		color: var(--text-4);
	}
</style>
