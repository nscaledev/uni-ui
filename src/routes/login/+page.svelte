<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Identity from '$lib/openapi/identity';
	import Logo from '$lib/logos/Logo.svelte';

	function login(provider: Identity.Oauth2ProviderType) {
		const providerInput = document.getElementById('provider') as HTMLInputElement;
		if (providerInput) {
			providerInput.value = provider;
		}

		const form = document.getElementById('login_form') as HTMLFormElement;
		if (form) {
			form.submit();
		}
	}

	interface Provider {
		type: Identity.Oauth2ProviderType;
		label: string;
		icon: string;
	}

	const providers: Array<Provider> = [
		{
			type: Identity.Oauth2ProviderType.Google,
			label: 'Google',
			icon: 'logos:google-icon'
		},
		{
			type: Identity.Oauth2ProviderType.Microsoft,
			label: 'Microsoft',
			icon: 'logos:microsoft-icon'
		},
		{
			type: Identity.Oauth2ProviderType.Github,
			label: 'GitHub',
			icon: 'mdi:github'
		}
	];
</script>

<div class="grid grid-cols-[1fr_max-content_1fr] grid-rows-[1fr_max-content_1fr] w-full h-screen">
	<div class="col-start-2 row-start-2 flex flex-col gap-8 items-center">
		<header class="h-16 w-auto">
			<Logo class="h-16 w-auto" />
		</header>

		<main class="flex flex-col gap-4 items-center">
			<form id="login_form" class="flex flex-col gap-8" method="post" action={data.callback}>
				<input name="state" type="hidden" value={data.state} />
				<input id="provider" name="provider" type="hidden" />

				<section class="flex flex-col gap-4 items-center">
					<p>Enter your email address</p>

					<input
						class="input shadow-lg"
						name="email"
						type="email"
						placeholder="jane.doe@acme.com"
						autocomplete="email"
						required
					/>
				</section>
			</form>

			<em class="text-surface-400">or</em>

			<section class="flex flex-col gap-4 items-center">
				<p>Choose a generic provider</p>

				<div class="flex justify-center gap-4">
					{#each providers as provider}
						{#if data.providers.includes(provider.type)}
							<button
								class="btn border border-surface-500 shadow-lg flex align-center"
								onclick={() => login(provider.type)}
								aria-label={provider.label}
							>
								<iconify-icon icon={provider.icon} class="p-1 text-xl"></iconify-icon>
							</button>
						{/if}
					{/each}
				</div>
			</section>
		</main>
	</div>
</div>
