<script lang="ts">
	import Spinner from '$lib/primitives/Spinner.svelte';
</script>

<!-- I will never get rendered due to page.ts blocking, returning a promise means redirect doesn't work -->
<div class="grid grid-cols-3 grid-rows-3 w-full h-screen">
	<div class="col-start-2 row-start-2 flex flex-col gap-4 items-center">
		<div class="h2">Exchanging credentials</div>
		<Spinner class="text-2xl" />
	</div>
</div>
