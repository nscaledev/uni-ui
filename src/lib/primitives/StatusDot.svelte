<script lang="ts">
	// Variant maps directly to the chip colour system so StatusDot can be
	// dropped inside a .chip or used standalone.
	interface Props {
		variant: 'ok' | 'warn' | 'err' | 'info' | 'muted';
	}

	let { variant }: Props = $props();
</script>

<span class="status-dot status-dot--{variant}" aria-hidden="true"></span>

<style>
	.status-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 999px;
		flex-shrink: 0;
	}

	.status-dot--ok {
		background: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}
	.status-dot--warn {
		background: var(--warn);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--warn) 20%, transparent);
	}
	.status-dot--err {
		background: var(--danger);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--danger) 20%, transparent);
	}
	.status-dot--info {
		background: var(--info);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--info) 20%, transparent);
	}
	.status-dot--muted {
		background: var(--text-4);
		box-shadow: none;
	}
</style>
