<script lang="ts">
	import type { LayoutData } from './$types';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	import { AppBar, Avatar, Modal, Popover } from '@skeletonlabs/skeleton-svelte';
	import Toast from '$lib/primitives/Toast.svelte';

	/* Required for OpenTelemetry */
	import { Resource } from '@opentelemetry/resources';
	import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
	import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';

	const provider = new BasicTracerProvider({
		resource: new Resource({
			[SemanticResourceAttributes.SERVICE_NAME]: 'unikorn-ui'
		})
	});

	provider.register();

	import { logout } from '$lib/credentials';
	import Logo from '$lib/logos/Logo.svelte';
	import SideBar from '$lib/shell/SideBar.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	import Spinner from '$lib/primitives/Spinner.svelte';

	/* Loading spinner */
	let loading = $state(false);

	beforeNavigate(() => (loading = true));
	afterNavigate(() => (loading = false));

	/* Side menu */
	let drawerOpen = $state(false);

	/* User preferences dropdown */
	let preferencesOpen = $state(false);

	/* Profile data */
	let email = $derived(data.profile.email);

	let name = $derived.by(() => {
		if (data.profile.given_name && data.profile.family_name) {
			return data.profile.given_name + ' ' + data.profile.family_name;
		} else if (data.profile.name) {
			return data.profile.name;
		}

		return '?';
	});

	let picture = $derived(data.profile.picture);
</script>

{#if loading}
	<div
		class="bg-transparent absolute h-screen w-screen z-10 backdrop-blur flex items-center justify-center"
		in:fade={{ duration: 1000 }}
		out:fade={{ duration: 200 }}
	>
		<Spinner class="text-primary-600-400 text-5xl" />
	</div>
{/if}

<Toast />

<div class="w-screen h-screen flex flex-col">
	<AppBar background="bg-surface-50-950" border="border-b border-surface-200-800">
		{#snippet lead()}
			<div class="flex items-center gap-4">
				<!-- Hamburger menu (mobile only) -->
				<Modal
					open={drawerOpen}
					onOpenChange={(e) => (drawerOpen = e.open)}
					contentBase="bg-surface-50-950 shadow-xl w-[320px] h-screen"
					triggerBase="flex items-center"
					positionerJustify="justify-start"
					positionerAlign=""
					positionerPadding=""
					transitionsPositionerIn={{ x: -320, duration: 200 }}
					transitionsPositionerOut={{ x: -320, duration: 200 }}
				>
					{#snippet trigger()}
						<Icon name="menu" size={20} class="text-3xl lg:!hidden align-center" />
					{/snippet}
					{#snippet content()}
						<SideBar
							organizations={data.organizations}
							organizationID={data.organizationID}
							acl={data.acl}
							onClicked={() => (drawerOpen = false)}
						/>
					{/snippet}
				</Modal>

				<!-- Logo, crop to just the icon in responsive mode -->
				<a href="/">
					<div class="w-8 w-auto overflow-hidden">
						<Logo class="h-8 w-auto" />
					</div>
				</a>
			</div>
		{/snippet}

		{#snippet trail()}
			<!-- User drop down -->
			<Popover open={preferencesOpen} onOpenChange={(e) => (preferencesOpen = e.open)}>
				{#snippet trigger()}
					<Avatar
						{name}
						src={picture}
						size="!w-10 !h-10"
						font="text-md"
						background="preset-filled-primary-500"
						shadow="shadow-lg"
					/>
				{/snippet}

				{#snippet content()}
					<div class="card bg-surface-50-950 shadow-lg p-4 flex flex-col gap-4">
						<section class="flex gap-2 items-center">
							<Icon name="user" size={20} class="text-2xl text-primary-600-400" />
							{email}
						</section>

						<hr class="!border-t-1 border-surface-200-800" />

						<button class="btn hover:preset-tonal-primary justify-start" onclick={logout}>
							<div class="flex gap-2 items-center">
								<Icon name="logout" size={20} class="text-2xl text-primary-600-400" />
								Logout
							</div>
						</button>
					</div>
				{/snippet}
			</Popover>
		{/snippet}
	</AppBar>

	<div class="w-full h-full flex overflow-hidden bg-surface-100-900/10">
		<div class="hidden lg:block lg:w-[320px] overflow-y-auto min-h-full">
			<SideBar
				organizations={data.organizations}
				organizationID={data.organizationID}
				acl={data.acl}
			/>
		</div>

		<div class="flex-1 overflow-y-auto flex flex-col shadow-inner">
			<main class="p-4 lg:px-16 lg:py-8 w-full mx-auto flex flex-col gap-8">
				{@render children?.()}
			</main>
		</div>
	</div>
</div>
