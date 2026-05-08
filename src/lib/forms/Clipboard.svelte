<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		id: string;
		value: string;
	}

	let { id, value }: Props = $props();

	let copied = $state(false);

	function copyToClipboard() {
		const input = document.getElementById(id) as HTMLInputElement;
		if (!input) return;

		navigator.clipboard.writeText(input.value).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}
</script>

<div class="clipboard">
	<input {id} {value} type="text" disabled class="clipboard__input" aria-label={value} />
	<button class="clipboard__btn" onclick={copyToClipboard} aria-label="Copy to clipboard">
		<Icon name={copied ? 'check' : 'copy'} size={14} />
		<span>{copied ? 'Copied' : 'Copy'}</span>
	</button>
</div>

<style>
	.clipboard {
		display: flex;
		align-items: center;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-inset);
		overflow: hidden;
	}

	.clipboard__input {
		flex: 1;
		min-width: 0;
		height: 34px;
		padding: 0 10px;
		background: transparent;
		border: 0;
		outline: 0;
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.clipboard__btn {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 34px;
		padding: 0 12px;
		border-left: 1px solid var(--line);
		color: var(--text-2);
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
		transition:
			background 120ms var(--ease),
			color 120ms var(--ease);
		flex-shrink: 0;
	}

	.clipboard__btn:hover {
		background: var(--bg-2);
		color: var(--text-1);
	}
</style>
