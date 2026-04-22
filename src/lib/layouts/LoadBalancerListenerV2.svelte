<script lang="ts">
	import * as Validation from '$lib/validation';
	import * as Region from '$lib/openapi/region';

	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import NumberInput from '$lib/forms/NumberInput.svelte';
	import Select from '$lib/forms/Select.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';

	interface Props {
		listener: Region.LoadBalancerListenerV2;
		editable?: boolean;
		valid?: boolean;
	}

	let { listener = $bindable(), editable = true, valid = $bindable(true) }: Props = $props();

	let nameValid = $state(false);
	let activeMemberIndex: number | null = $state(null);
	let memberActive = $state(false);
	let memberAddressValid = $state(false);
	let healthCheckEnabled = $state(listener.pool.healthCheck !== undefined);

	function isRequiredInteger(value: number | undefined): boolean {
		return value !== undefined && Number.isInteger(value);
	}

	function isOptionalInteger(value: number | undefined): boolean {
		return value === undefined || Number.isInteger(value);
	}

	function healthCheckValid(): boolean {
		if (!healthCheckEnabled || !listener.pool.healthCheck) {
			return true;
		}

		return (
			isRequiredInteger(listener.pool.healthCheck.intervalSeconds) &&
			isRequiredInteger(listener.pool.healthCheck.timeoutSeconds) &&
			isRequiredInteger(listener.pool.healthCheck.healthyThreshold) &&
			isRequiredInteger(listener.pool.healthCheck.unhealthyThreshold)
		);
	}

	let memberValid = $derived.by(() => {
		if (activeMemberIndex == null) {
			return true;
		}

		const member = listener.pool.members[activeMemberIndex];

		return memberAddressValid && isRequiredInteger(member?.port);
	});

	$effect.pre(() => {
		valid =
			nameValid &&
			Boolean(listener.protocol) &&
			isRequiredInteger(listener.port) &&
			isOptionalInteger(listener.idleTimeoutSeconds) &&
			healthCheckValid() &&
			!memberActive;
	});

	function addMember(): number {
		listener.pool.members.push({
			address: '',
			port: listener.port
		});

		return listener.pool.members.length - 1;
	}

	function removeMember(index: number) {
		listener.pool.members.splice(index, 1);
	}

	function printList(values: Array<string> | undefined): string {
		return values?.length ? values.join(', ') : 'Any';
	}

	function printHealthCheck(healthCheck: Region.LoadBalancerHealthCheckV2 | undefined): string {
		if (!healthCheck) {
			return 'Disabled';
		}

		return [
			`Interval ${healthCheck.intervalSeconds ?? '-'}`,
			`Timeout ${healthCheck.timeoutSeconds ?? '-'}`,
			`Healthy ${healthCheck.healthyThreshold ?? '-'}`,
			`Unhealthy ${healthCheck.unhealthyThreshold ?? '-'}`
		].join(', ');
	}

	function toggleHealthCheck(enabled: boolean) {
		healthCheckEnabled = enabled;
		listener.pool.healthCheck = enabled
			? {
					intervalSeconds: 10,
					timeoutSeconds: 5,
					healthyThreshold: 2,
					unhealthyThreshold: 2
				}
			: undefined;
	}
</script>

{#if editable}
	<div class="flex flex-col gap-6">
		<TextInput
			bind:value={listener.name}
			label="Listener name."
			hint={Validation.kubernetesLabelValueHint}
			validators={Validation.GetKubernetesLabelValueValidators(undefined)}
			bind:valid={nameValid}
		/>

		<Select bind:value={listener.protocol} label="Protocol.">
			<option value={Region.LoadBalancerListenerProtocolV2.Tcp}>TCP</option>
			<option value={Region.LoadBalancerListenerProtocolV2.Udp}>UDP</option>
		</Select>

		<NumberInput bind:value={listener.port} label="Port." min={1} max={65535} />

		<InputChips
			name={'allowed-cidrs-' + listener.name}
			bind:value={listener.allowedCidrs}
			label="Allowed CIDRs"
			hint="Leave this empty to allow traffic from any source."
		/>

		<NumberInput
			bind:value={listener.idleTimeoutSeconds}
			label="Idle timeout in seconds."
			min={1}
		/>

		<Switch
			name={'proxy-protocol-v2-' + listener.name}
			initial={listener.pool.proxyProtocolV2 ?? false}
			label="Enable Proxy Protocol v2."
			onCheckedChange={(event) => (listener.pool.proxyProtocolV2 = event.checked)}
		/>

		<Switch
			name={'health-check-' + listener.name}
			initial={healthCheckEnabled}
			label="Enable health check."
			onCheckedChange={(event) => toggleHealthCheck(event.checked)}
		/>

		{#if listener.pool.healthCheck}
			<div class="grid gap-4 md:grid-cols-2">
				<NumberInput
					bind:value={listener.pool.healthCheck.intervalSeconds}
					label="Interval seconds."
					min={1}
				/>
				<NumberInput
					bind:value={listener.pool.healthCheck.timeoutSeconds}
					label="Timeout seconds."
					min={1}
				/>
				<NumberInput
					bind:value={listener.pool.healthCheck.healthyThreshold}
					label="Healthy threshold."
					min={1}
				/>
				<NumberInput
					bind:value={listener.pool.healthCheck.unhealthyThreshold}
					label="Unhealthy threshold."
					min={1}
				/>
			</div>
		{/if}

		<ResourceList
			title="Pool Members"
			titleClass="h4"
			columns={2}
			items={listener.pool.members}
			bind:active={memberActive}
			valid={memberValid}
			add={addMember}
			remove={removeMember}
			activate={(index) => (activeMemberIndex = index)}
			deactivate={() => (activeMemberIndex = null)}
		>
			{#snippet normal(member: Region.LoadBalancerMemberV2, index: number)}
				<div class="flex gap-2 items-center">
					<iconify-icon icon="mdi:ip-network-outline" class="text-2xl"></iconify-icon>
					{member.address || `Member ${index + 1}`}
				</div>
				<div class="flex gap-2 items-center">
					<iconify-icon icon="fluent:usb-port-24-regular" class="text-2xl"></iconify-icon>
					{member.port}
				</div>
			{/snippet}

			<!-- eslint-disable @typescript-eslint/no-unused-vars -->
			{#snippet expanded(member: Region.LoadBalancerMemberV2, index: number)}
				<div class="grid gap-4 md:grid-cols-2">
					<TextInput
						bind:value={listener.pool.members[index].address}
						label="Member address."
						validators={[Validation.stringSet]}
						bind:valid={memberAddressValid}
					/>
					<NumberInput
						bind:value={listener.pool.members[index].port}
						label="Member port."
						min={1}
						max={65535}
					/>
				</div>
			{/snippet}
		</ResourceList>
	</div>
{:else}
	<div class="card preset-outlined-surface-500 shadow-lg p-4 flex flex-col gap-4">
		<div class="grid grid-cols-[repeat(3,max-content)] gap-2 text-sm">
			<ShellMetadataItem icon="mdi:label-outline" label="Name" value={listener.name} />
			<ShellMetadataItem
				icon="mdi:transit-connection-variant"
				label="Protocol"
				value={listener.protocol.toUpperCase()}
			/>
			<ShellMetadataItem
				icon="fluent:usb-port-24-regular"
				label="Port"
				value={listener.port.toString()}
			/>
			<ShellMetadataItem
				icon="mdi:check-network-outline"
				label="Allowed CIDRs"
				value={printList(listener.allowedCidrs)}
			/>
			<ShellMetadataItem
				icon="mdi:timer-outline"
				label="Idle Timeout"
				value={listener.idleTimeoutSeconds?.toString() || 'Default'}
			/>
			<ShellMetadataItem
				icon="mdi:swap-horizontal"
				label="Proxy Protocol v2"
				value={listener.pool.proxyProtocolV2 ? 'Enabled' : 'Disabled'}
			/>
			<ShellMetadataItem
				icon="mdi:heart-pulse"
				label="Health Check"
				value={printHealthCheck(listener.pool.healthCheck)}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<div class="font-bold">Pool Members</div>

			{#if listener.pool.members.length}
				<div class="grid gap-2">
					{#each listener.pool.members as member}
						<div class="grid grid-cols-[max-content_1fr] gap-2 text-sm">
							<iconify-icon icon="mdi:server-network-outline" class="text-primary-600-400 text-lg"
							></iconify-icon>
							<div>{member.address}:{member.port}</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-sm italic text-surface-700-300">No pool members configured.</div>
			{/if}
		</div>
	</div>
{/if}
