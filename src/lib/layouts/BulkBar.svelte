<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		count: number;
		onClear: () => void;
		actions?: Snippet;
	}

	let { count, onClear, actions }: Props = $props();
</script>

<div class="bulkbar">
	<div class="bulkbar__count">{count} selected</div>
	{@render actions?.()}
	<span class="spacer"></span>
	<button class="btn btn--sm btn--ghost" onclick={onClear}>
		<Icon name="x" size={13} /> Clear
	</button>
</div>
