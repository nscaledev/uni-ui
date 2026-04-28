<script lang="ts">
	import { toastsStore, toaster } from '$lib/toaster';
	import Icon from '$lib/primitives/Icon.svelte';

	const iconMap = {
		success: 'checkCircle',
		error: 'alert',
		info: 'info'
	} as const;
</script>

<div class="toast-stack" aria-live="polite" aria-atomic="false">
	{#each $toastsStore as toast (toast.id)}
		<div class="toast toast--{toast.level}" role="alert">
			<Icon name={iconMap[toast.level]} size={16} class="toast__icon" />

			<div class="toast__body">
				<div class="toast__title">{toast.title}</div>
				{#if toast.description}
					<p class="toast__desc">{toast.description}</p>
				{/if}
			</div>

			<button class="toast__close" aria-label="Dismiss" onclick={() => toaster.remove(toast.id)}>
				<Icon name="x" size={14} />
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-stack {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 300;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
		width: 360px;
		max-width: calc(100vw - 32px);
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		background: var(--bg-1);
		border: 1px solid var(--line-strong);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-pop);
		pointer-events: auto;
		animation: toast-in 200ms var(--ease) both;
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.toast--success :global(.toast__icon) {
		color: #4ade80;
		flex-shrink: 0;
		margin-top: 1px;
	}
	.toast--error :global(.toast__icon) {
		color: var(--danger);
		flex-shrink: 0;
		margin-top: 1px;
	}
	.toast--info :global(.toast__icon) {
		color: var(--info);
		flex-shrink: 0;
		margin-top: 1px;
	}

	.toast__body {
		flex: 1;
		min-width: 0;
	}

	.toast__title {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-1);
		line-height: 1.3;
	}

	.toast__desc {
		font-size: 12px;
		color: var(--text-2);
		line-height: 1.45;
		margin: 4px 0 0;
		word-break: break-word;
	}

	.toast__close {
		display: flex;
		align-items: center;
		color: var(--text-3);
		flex-shrink: 0;
		padding: 2px;
		border-radius: 4px;
		margin-top: 1px;
	}

	.toast__close:hover {
		color: var(--text-1);
		background: var(--bg-2);
	}
</style>
