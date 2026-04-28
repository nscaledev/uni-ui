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

<style>
	.auth-screen {
		display: grid;
		place-items: center;
		min-height: 100vh;
		background: var(--bg-0);
	}

	.auth-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 40px;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-md);
		min-width: 320px;
	}

	.auth-card__logo {
		display: flex;
		justify-content: center;
	}

	:global(.auth-logo) {
		height: 48px;
		width: auto;
	}

	.auth-welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		text-align: center;
	}

	.auth-welcome__title {
		font-size: 22px;
		font-weight: 600;
		color: var(--text-1);
	}

	.auth-welcome__subtitle {
		font-size: 13px;
		color: var(--text-3);
	}

	.auth-card__body {
		width: 100%;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
	}

	.auth-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		width: 100%;
	}

	.auth-section__label {
		font-size: 13px;
		color: var(--text-2);
	}
</style>
