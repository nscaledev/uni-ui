<script lang="ts">
	import { page } from '$app/stores';
	import { Accordion } from 'bits-ui';

	import Icon from '$lib/primitives/Icon.svelte';
	import * as Identity from '$lib/openapi/identity';
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
		{ href: '/', title: 'Dashboard', icon: 'dashboard' }
	];

	const nav: Nav = $derived.by(() => {
		const all: Nav = [
			{
				base: '/identity',
				title: 'Identity',
				icon: 'user',
				items: [
					{
						label: 'Organization',
						href: 'organizations',
						rbac: [
							{ endpoint: 'identity:organizations', operations: [Identity.AclOperation.Update] }
						]
					},
					{
						label: 'Quotas',
						href: 'quotas',
						rbac: [{ endpoint: 'identity:quotas', operations: [Identity.AclOperation.Update] }]
					},
					{
						label: 'Users',
						href: 'users',
						rbac: [{ endpoint: 'identity:users', operations: [Identity.AclOperation.Read] }]
					},
					{
						label: 'Service Accounts',
						href: 'serviceaccounts',
						rbac: [
							{ endpoint: 'identity:serviceaccounts', operations: [Identity.AclOperation.Read] }
						]
					},
					{
						label: 'Groups',
						href: 'groups',
						rbac: [{ endpoint: 'identity:groups', operations: [Identity.AclOperation.Read] }]
					},
					{
						label: 'Projects',
						href: 'projects',
						rbac: [{ endpoint: 'identity:projects', operations: [Identity.AclOperation.Read] }]
					},
					{
						label: 'SSH Certificate CAs',
						href: 'sshcertificateauthorities',
						rbac: [
							{
								endpoint: 'region:sshcertificateauthorities:v2',
								operations: [Identity.AclOperation.Read]
							}
						]
					},
					{
						label: 'SSH Certificate CAs',
						href: 'sshcertificateauthorities',
						rbac: [
							{
								endpoint: 'region:sshcertificateauthorities:v2',
								operations: [Identity.AclOperation.Read]
							}
						]
					}
				]
			},
			{
				base: '/network',
				title: 'Network',
				icon: 'network',
				items: [
					{
						label: 'Networks',
						href: 'networks',
						rbac: [{ endpoint: 'region:networks:v2', operations: [Identity.AclOperation.Read] }]
					},
					{
						label: 'Security Groups',
						href: 'securitygroups',
						rbac: [
							{ endpoint: 'region:securitygroups:v2', operations: [Identity.AclOperation.Read] }
						]
					},
					{
						label: 'Load Balancers',
						href: 'loadbalancers',
						rbac: [
							{
								endpoint: 'region:loadbalancers:v2',
								operations: [Identity.AclOperation.Read]
							}
						]
					}
				]
			},
			{
				base: '/compute',
				title: 'Compute',
				icon: 'cpu',
				items: [
					{
						label: 'Instances',
						href: 'instances',
						rbac: [{ endpoint: 'compute:instances', operations: [Identity.AclOperation.Read] }]
					}
				]
			},
			{
				base: '/kubernetes',
				title: 'Kubernetes',
				icon: 'k8s',
				items: [
					{
						label: 'Clusters',
						href: 'clusters',
						rbac: [{ endpoint: 'kubernetes:clusters', operations: [Identity.AclOperation.Read] }]
					}
				]
			}
		];

		return all
			.map((section) => ({
				...section,
				items: section.items.filter(
					(item) => !item.rbac || RBAC.organizationScopesAllowed(acl, organizationID, item.rbac)
				)
			}))
			.filter((section) => section.items.length > 0);
	});

	// Track which accordion section is open based on current URL
	let openSection = $state('');

	$effect.pre(() => {
		if (openSection) return;
		const match = nav.find((s) => $page.url.pathname.startsWith(s.base));
		if (match) openSection = match.title;
	});

	// Active sub-item
	const activeItem = $derived.by(() => {
		const section = nav.find((s) => $page.url.pathname.startsWith(s.base));
		if (!section) return null;
		return section.items.find((item) =>
			$page.url.pathname.startsWith(section.base + '/' + item.href)
		);
	});
</script>

<aside class="sidebar">
	<!-- Static nav (Dashboard) -->
	<div class="nav-group-title">Overview</div>
	{#each navStatic as entry}
		<a
			href={entry.href}
			class="nav-item"
			class:active={$page.url.pathname === entry.href}
			onclick={onClicked}
		>
			<Icon name={entry.icon} size={15} />
			<span class="label">{entry.title}</span>
		</a>
	{/each}

	<!-- Grouped nav via Accordion -->
	<div class="nav-group-title">Resources</div>
	<Accordion.Root type="single" value={openSection} onValueChange={(v) => (openSection = v)}>
		{#each nav as section}
			<Accordion.Item value={section.title}>
				<Accordion.Header>
					<Accordion.Trigger class="nav-item nav-trigger">
						<Icon name={section.icon} size={15} />
						<span class="label">{section.title}</span>
						<Icon name="chevronDown" size={12} class="nav-chevron" />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Content>
					<div class="nav-sub-group">
						{#each section.items as item}
							<a
								href={section.base + '/' + item.href}
								class="nav-item nav-sub"
								class:active={activeItem === item}
								onclick={onClicked}
							>
								<span class="label">{item.label}</span>
							</a>
						{/each}
					</div>
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>

	<!-- Health indicator -->
	<div class="sidebar-health">
		<span class="sidebar-health__dot"></span>
		<span class="sidebar-health__label">All regions healthy</span>
	</div>
</aside>

<style>
	/* Accordion trigger inherits nav-item but also needs full-width button reset */
	:global(.nav-trigger) {
		background: none;
		border: none;
		padding: 0 10px;
		cursor: pointer;
		width: 100%;
	}

	:global(.nav-chevron) {
		margin-left: auto;
		color: var(--text-4);
		transition: transform 200ms var(--ease);
	}

	:global([data-state='open'] .nav-chevron) {
		transform: rotate(180deg);
	}

	.nav-sub-group {
		margin: 2px 0 6px;
	}

	.sidebar-health {
		margin-top: auto;
		padding-top: 14px;
		border-top: 1px solid var(--line-weak);
		display: flex;
		align-items: center;
		gap: 8px;
		padding-left: 10px;
	}

	.sidebar-health__dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: var(--accent);
		box-shadow: 0 0 8px var(--accent);
		flex-shrink: 0;
	}

	.sidebar-health__label {
		font-size: 11.5px;
		color: var(--text-3);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
