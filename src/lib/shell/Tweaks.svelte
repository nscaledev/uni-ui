<script lang="ts">
	import { appearance, surface, tweaksOpen } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	const appearances = [
		{ value: 'light', label: 'Light' },
		{ value: 'dim', label: 'Dim' },
		{ value: 'dark', label: 'Dark' }
	] as const;

	const surfaces = [
		{ value: 'solid', label: 'Solid' },
		{ value: 'glass', label: 'Glass' }
	] as const;

	// Apply tokens to <html> — runs always, not gated on panel visibility.
	$effect(() => {
		if (!browser) return;
		document.documentElement.setAttribute('data-appearance', $appearance);
		document.documentElement.setAttribute('data-surface', $surface);
	});
</script>

{#if $tweaksOpen}
	<div class="tweaks">
		<div class="tweaks__title">Display</div>

		<div class="tweaks__row">
			<div class="tweaks__label">Appearance</div>
			<div class="tweaks__seg">
				{#each appearances as a}
					<button class:active={$appearance === a.value} onclick={() => appearance.set(a.value)}>
						{a.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="tweaks__row" style="margin-bottom:0">
			<div class="tweaks__label">Surface</div>
			<div class="tweaks__seg">
				{#each surfaces as s}
					<button class:active={$surface === s.value} onclick={() => surface.set(s.value)}>
						{s.label}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}
