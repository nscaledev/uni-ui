<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: cls = '' }: Props = $props();
</script>

<span class="spinner {cls}" role="status" aria-label="Loading">
	<span></span>
	<span></span>
	<span></span>
	<span></span>
</span>

<style>
	.spinner {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		height: 1em;
	}

	.spinner span {
		display: block;
		width: 3px;
		height: 100%;
		border-radius: 2px;
		background: currentColor;
		animation: bars-scale 1s ease-in-out infinite;
	}

	.spinner span:nth-child(1) {
		animation-delay: 0s;
	}
	.spinner span:nth-child(2) {
		animation-delay: 0.1s;
	}
	.spinner span:nth-child(3) {
		animation-delay: 0.2s;
	}
	.spinner span:nth-child(4) {
		animation-delay: 0.3s;
	}

	@keyframes bars-scale {
		0%,
		100% {
			transform: scaleY(0.4);
			opacity: 0.5;
		}
		50% {
			transform: scaleY(1);
			opacity: 1;
		}
	}
</style>
