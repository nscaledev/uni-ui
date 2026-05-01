<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import { page } from '$app/state';
	import Logo from '$lib/logos/Logo.svelte';

	let who = $derived.by(() => {
		if (page.url.searchParams.has('forename')) return page.url.searchParams.get('forename');
		if (page.url.searchParams.has('username')) return page.url.searchParams.get('username');
		return '';
	});
</script>

<div class="auth-screen">
	<div class="auth-card">
		<header class="auth-card__logo">
			<Logo class="auth-logo" />
		</header>

		<div class="auth-welcome">
			<h1 class="auth-welcome__title">Welcome{who ? ' ' + who : ''}!</h1>
			<p class="auth-welcome__subtitle">Let's get started.</p>
		</div>

		<main class="auth-card__body">
			<form id="login_form" class="auth-form" method="post" action={data.callback}>
				<input name="state" type="hidden" value={data.state} />
				<input name="group_name" type="hidden" value="administrators" />
				<input name="group_description" type="hidden" value="Organization administrator users." />

				<section class="auth-section">
					<p class="auth-section__label">Choose an organization name</p>
					<input class="input" name="organization_name" placeholder="acme.com" required />
				</section>

				<button type="submit" class="btn btn--primary">Create Organization</button>
			</form>
		</main>
	</div>
</div>
