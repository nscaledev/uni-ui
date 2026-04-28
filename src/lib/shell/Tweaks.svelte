<script lang="ts">
	import { appearance, surface } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	const appearances = [
		{ value: 'light', label: 'Light', icon: '☀' },
		{ value: 'dim', label: 'Dim', icon: '◑' },
		{ value: 'dark', label: 'Dark', icon: '☾' }
	] as const;

	const surfaces = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'glass', label: 'Glass' }
	] as const;

	// Apply data-appearance and data-surface to <html> so design.css token
	// selectors activate. Done here since Tweaks is always in the shell tree.
	$effect(() => {
		if (!browser) return;
		document.documentElement.setAttribute('data-appearance', $appearance);
		document.documentElement.setAttribute('data-surface', $surface);
	});
</script>

<div class="tweaks">
	<div class="tweaks__label">Appearance</div>
	<div class="tweaks__seg">
		{#each appearances as a}
			<button
				class="tweaks__opt"
				class:tweaks__opt--on={$appearance === a.value}
				onclick={() => appearance.set(a.value)}
				title={a.label}
			>
				{a.icon}
			</button>
		{/each}
	</div>

	<div class="tweaks__label">Surface</div>
	<div class="tweaks__seg">
		{#each surfaces as s}
			<button
				class="tweaks__opt"
				class:tweaks__opt--on={$surface === s.value}
				onclick={() => surface.set(s.value)}
			>
				{s.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.tweaks {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 200;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 10px;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-pop);
		font-size: 11.5px;
		color: var(--text-3);
	}

	.tweaks__label {
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-4);
	}

	.tweaks__seg {
		display: flex;
		gap: 2px;
		background: var(--bg-2);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 2px;
	}

	.tweaks__opt {
		height: 22px;
		padding: 0 8px;
		border-radius: 4px;
		font-size: 11.5px;
		color: var(--text-3);
		transition:
			background 120ms var(--ease),
			color 120ms var(--ease);
	}

	.tweaks__opt--on {
		background: var(--bg-3);
		color: var(--text-1);
		box-shadow: var(--shadow-inset);
	}
</style>
