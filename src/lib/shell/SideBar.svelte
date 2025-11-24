<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	import { Navigation, Accordion } from '@skeletonlabs/skeleton-svelte';

	import type { InternalToken } from '$lib/oauth2';
	import { logout } from '$lib/credentials';
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import * as OIDC from '$lib/oidc';
	import * as Stores from '$lib/stores';
	import * as RBAC from '$lib/rbac';

	interface Props {
		organizations: Array<Identity.OrganizationRead>;
		organizationID: string;
		acl: Identity.Acl;
		onClicked?: () => void;
	}

	let { organizations, organizationID, acl, onClicked }: Props = $props();

	type NavItems = Array<{ label: string; href: string; rbac?: Array<RBAC.OrganizationScope> }>;
	type Nav = Array<{ base: string; title: string; icon: string; items: NavItems }>;

	const navStatic: Array<{ href: string; title: string; icon: string }> = [
		{
			href: '/',
			title: 'Dashboard',
			icon: 'mdi:gauge'
		}
	];

	const nav: Nav = $derived.by(() => {
		const nav = [
			{
				base: '/identity',
				title: 'Identity',
				icon: 'mdi:perm-identity',
				items: [
					{
						label: 'Organization',
						href: 'organizations',
						rbac: [
							{
								endpoint: 'identity:organizations',
								operations: [Identity.AclOperation.Update]
							}
						]
					},
					{
						label: 'OAuth2 Providers',
						href: 'oauth2providers',
						rbac: [
							{
								endpoint: 'identity:oauth2providers',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Quotas',
						href: 'quotas',
						rbac: [
							{
								endpoint: 'identity:quotas',
								operations: [Identity.AclOperation.Update]
							}
						]
					},
					{
						label: 'Users',
						href: 'users',
						rbac: [
							{
								endpoint: 'identity:users',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Service Accounts',
						href: 'serviceaccounts',
						rbac: [
							{
								endpoint: 'identity:serviceaccounts',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Groups',
						href: 'groups',
						rbac: [
							{
								endpoint: 'identity:groups',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Projects',
						href: 'projects',
						rbac: [
							{
								endpoint: 'identity:projects',
								operations: [Identity.AclOperation.Read]
							}
						]
					}
				]
			},
			{
				base: '/network',
				title: 'Network',
				icon: 'mdi:network-outline',
				items: [
					{
						label: 'Networks',
						href: 'networks',
						rbac: [
							{
								endpoint: 'region:networks:v2',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Security Groups',
						href: 'securitygroups',
						rbac: [
							{
								endpoint: 'region:securitygroups:v2',
								operations: [Identity.AclOperation.Read]
							}
						]
					}
				]
			},
			{
				base: '/compute',
				title: 'Compute',
				icon: 'mdi:computer',
				items: [
					{
						label: 'Instances',
						href: 'instances',
						rbac: [
							{
								endpoint: 'compute:instances',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Clusters',
						href: 'clusters2',
						rbac: [
							{
								endpoint: 'compute:clusters',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Clusters (Legacy)',
						href: 'clusters',
						rbac: [
							{
								endpoint: 'compute:clusters',
								operations: [Identity.AclOperation.Read]
							}
						]
					}
				]
			},
			{
				base: '/kubernetes',
				title: 'Kubernetes',
				icon: 'mdi:kubernetes',
				items: [
					{
						label: 'Virtual clusters',
						href: 'virtualclusters',
						rbac: [
							{
								endpoint: 'kubernetes:virtualclusters',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Clusters',
						href: 'clusters',
						rbac: [
							{
								endpoint: 'kubernetes:clusters',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Cluster Managers',
						href: 'clustermanagers',
						rbac: [
							{
								endpoint: 'kubernetes:clustermanagers',
								operations: [Identity.AclOperation.Read]
							}
						]
					}
				]
			},
			{
				base: '/regions',
				title: 'Regions',
				icon: 'mdi:web',
				items: [
					{
						label: 'Identities',
						href: 'identities',
						rbac: [
							{
								endpoint: 'region:identities',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'Networks',
						href: 'networks',
						rbac: [
							{
								endpoint: 'region:networks',
								operations: [Identity.AclOperation.Read]
							}
						]
					}
				]
			}
		];

		let filteredNav: Nav = [];

		for (const item of nav) {
			const filtered = item.items.filter(
				(x) => !x.rbac || RBAC.organizationScopesAllowed(acl, organizationID, x.rbac)
			);
			if (!filtered.length) continue;

			filteredNav.push({
				base: item.base,
				title: item.title,
				icon: item.icon,
				items: filtered
			});
		}

		return filteredNav;
	});

	let activeTitle = $state([] as Array<string>);

	$effect.pre(() => {
		if (!nav || activeTitle.length > 0) return;

		const item = nav.find((x) => $page.url.pathname.startsWith(x.base));
		if (!item) return;

		activeTitle = [item.title];
	});

	let activeItem = $derived.by(() => {
		if (!nav) return;

		const item = nav.find((x) => $page.url.pathname.startsWith(x.base));
		if (!item) return;

		return item.items?.find((x) => $page.url.pathname.startsWith(item.base + '/' + x.href));
	});

	let selectedOrganizationID = $state(organizationID);

	$effect.pre(() => {
		if (!browser) return;

		if (selectedOrganizationID != organizationID) {
			window.localStorage.setItem('organization_id', selectedOrganizationID);

			invalidate('app:organization_id');
		}
	});
</script>

<div class="flex flex-col overflow-y-auto min-h-full border-r border-surface-200-800">
	<!-- Oragnization -->
	<div class="p-4 flex flex-col gap-4 text-sm">
		<div class="font-bold">Organization</div>

		<div class="input-group grid-cols-[auto_1fr] shadow-lg">
			<div class="ig-cell">
				<iconify-icon icon="mdi:office-building-outline" class="text-lg text-primary-600-400"
				></iconify-icon>
			</div>
			<select class="ig-select" bind:value={selectedOrganizationID}>
				{#each organizations || [] as organization}
					<option value={organization.metadata.id}>{organization.metadata.name}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="flex flex-col">
		<div class="p-4 font-bold text-sm">Main Menu</div>

		{#each navStatic as entry}
			<a href={entry.href} class="flex gap-4 hover:preset-tonal-primary p-2 px-4 mb-2">
				<iconify-icon icon={entry.icon} class="text-2xl text-primary-600-400 align-middle"
				></iconify-icon>
				{entry.title}
			</a>
		{/each}

		<Accordion
			rounded="none"
			value={activeTitle}
			onValueChange={(e) => (activeTitle = e.value)}
			collapsible
		>
			{#each nav as entry}
				<Accordion.Item value={entry.title} panelPadding="">
					{#snippet lead()}
						<iconify-icon icon={entry.icon} class="text-2xl text-primary-600-400 align-middle"
						></iconify-icon>
					{/snippet}
					{#snippet control()}
						{entry.title}
					{/snippet}
					{#snippet panel()}
						<ul class="ml-12 mr-2 text-sm">
							{#each entry.items as item}
								<a
									href={entry.base + '/' + item.href}
									onclick={() => onClicked?.()}
									onkeypress={() => onClicked?.()}
								>
									<li
										class="p-2 hover:preset-tonal-primary rounded"
										class:preset-tonal-primary={activeItem == item}
									>
										{item.label}
									</li>
								</a>
							{/each}
						</ul>
					{/snippet}
				</Accordion.Item>
			{/each}
		</Accordion>
	</div>
</div>
