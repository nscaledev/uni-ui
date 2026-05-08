<script lang="ts">
	import Logo from '$lib/logos/Logo.svelte';
</script>

<div class="brand">
	<a href="/" class="brand__logo">
		<Logo class="brand-logo-svg" />
	</a>
	<div class="brand__env">console</div>
</div>

<style>
	:global(.brand-logo-svg) {
		height: 22px;
		width: auto;
		display: block;
		color: var(--text-1);
		fill: currentColor;
	}
</style>
