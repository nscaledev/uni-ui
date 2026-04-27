<script lang="ts">
	interface Props {
		id: string;
		value: string;
	}

	let { id, value }: Props = $props();

	function copyToClipboard() {
		const input = document.getElementById(id) as HTMLInputElement;
		if (!input) return;

		navigator.clipboard.writeText(input.value);
	}
</script>

<div class="input-group grid-cols-[1fr_auto]">
	<input
		{id}
		{value}
		type="text"
		disabled
		class="ig-input overflow-hidden text-ellipsis whitespace-nowrap"
	/>
	<button class="ig-btn flex items-center gap-2" onclick={() => copyToClipboard()}>
		<iconify-icon icon="mdi:clipboard-outline"></iconify-icon>
		<span>Copy</span>
	</button>
</div>
