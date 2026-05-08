<script lang="ts">
	interface Props {
		name?: string;
		label: string;
		hint?: string;
		// Preferred: use bind:checked={value}
		checked?: boolean;
		// Legacy: one-time initial value + change callback (Skeleton-compat)
		initial?: boolean;
		onCheckedChange?: (e: { checked: boolean }) => void;
		disabled?: boolean;
	}

	let {
		name,
		label,
		hint,
		checked = $bindable(false),
		initial,
		onCheckedChange,
		disabled = false
	}: Props = $props();

	// Apply initial value once on mount (legacy API support)
	if (initial !== undefined) checked = initial;

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onCheckedChange?.({ checked });
	}
</script>

<div class="form-row">
	<div class="form-row__left">
		<span class="form-row__title">{label}</span>
		{#if hint}<p class="form-row__hint">{hint}</p>{/if}
	</div>
	<div class="form-row__control">
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			class="toggle"
			class:toggle--on={checked}
			class:toggle--disabled={disabled}
			{disabled}
			onclick={toggle}
		>
			<span class="toggle__thumb"></span>
		</button>
	</div>
</div>

<style>
	.form-row__left {
		padding-top: 2px;
	}

	.form-row__control {
		display: flex;
		align-items: center;
	}

	.toggle {
		flex-shrink: 0;
		width: 40px;
		height: 22px;
		border-radius: 11px;
		background: var(--bg-3);
		border: 1px solid var(--line);
		position: relative;
		cursor: pointer;
		transition:
			background 200ms var(--ease),
			border-color 200ms var(--ease);
		padding: 0;
	}

	.toggle--on {
		background: var(--accent);
		border-color: var(--accent);
	}

	.toggle--disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toggle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 11px;
	}

	.toggle__thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--text-2);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
		transition:
			transform 200ms var(--ease),
			background 200ms var(--ease);
	}

	.toggle--on .toggle__thumb {
		transform: translateX(18px);
		background: var(--accent-ink);
	}
</style>
