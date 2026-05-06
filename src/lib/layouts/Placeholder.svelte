<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="placeholder">
	<Icon name="info" size={40} />
	<p class="placeholder__text">{@render children()}</p>
</div>

<style>
	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 48px 24px;
		color: var(--text-3);
	}

	.placeholder__text {
		font-size: 13px;
		font-weight: 500;
		text-align: center;
		max-width: 360px;
		line-height: 1.5;
		margin: 0;
	}
</style>
