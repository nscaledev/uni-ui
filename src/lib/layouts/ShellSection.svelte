<script lang="ts">
	interface Props {
		title: string;
		tools?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { title, tools, children }: Props = $props();
</script>

<div class="form-section">
	<header class="flex items-center justify-between">
		<div class="form-section__title">{title}</div>
		{@render tools?.()}
	</header>

	{@render children?.()}
</div>
