<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		// Unique element name.
		name: string;
		// default is the default state.
		initial?: boolean;
		// Whether the toggle is checked.
		onCheckedChange: (e: { checked: boolean }) => void;
		// Label to attach describing the input.
		label: string;
		// Formatting hint.
		hint?: string;
	}

	let { name, initial = false, onCheckedChange, label, hint = '' }: Props = $props();

	let previousInitial = $state<boolean | undefined>(undefined);
	let checked = $state(false);

	$effect.pre(() => {
		if (previousInitial === initial) {
			return;
		}

		previousInitial = initial;
		checked = initial;
	});

	function update(e: { checked: boolean }) {
		checked = e.checked;

		onCheckedChange(e);
	}
</script>

<div class="flex gap-4 items-center justify-between">
	<div class="flex flex-col gap-1">
		<div>{label}</div>

		{#if hint}
			<div class="text-xs italic text-surface-700-300">{hint}</div>
		{/if}
	</div>

	<Switch {name} {checked} onCheckedChange={update} />
</div>
