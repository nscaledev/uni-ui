<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="shell-list">
	{@render children?.()}
</div>

<style>
	.shell-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
</style>
