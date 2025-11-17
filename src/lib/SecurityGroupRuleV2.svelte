<script lang="ts">
	import * as Region from '$lib/openapi/region';
	import Select from '$lib/forms/Select.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import * as Validators from '$lib/validation';

	interface Props {
		// rule is the object we are filling in.
		rule: Region.SecurityGroupRuleV2;
		// valid if the all field validators resolve to true.
		valid?: boolean;
	}

	let { rule = $bindable(), valid = $bindable(false) }: Props = $props();

	let port: string = $state(rule.port ? rule.port.toString() : '');

	let portMax: string = $state(rule.portMax ? rule.portMax.toString() : '');

	let prefix: string = $state(rule.prefix || '');

	function isLayer4(protocol: Region.NetworkProtocol): boolean {
		return protocol == Region.NetworkProtocol.Tcp || protocol == Region.NetworkProtocol.Udp;
	}

	$effect.pre(() => {
		let allValid = true;

		if (isLayer4(rule.protocol)) {
			if (rule.port) {
				if (rule.port < 0 && rule.port >= 65535) allValid &&= false;

				if (rule.portMax) {
					if (rule.portMax < 0 && rule.portMax >= 65535) allValid &&= false;
				}
			} else {
				if (rule.portMax) allValid &&= false;
			}
		}

		valid = allValid;
	});

	$effect.pre(() => {
		if (!isLayer4(rule.protocol) || port == '') {
			delete rule.port;
			return;
		}

		const x = parseInt(port, 10);
		if (isNaN(x)) {
			return;
		}

		rule.port = x;
	});

	$effect.pre(() => {
		if (!isLayer4(rule.protocol) || portMax == '') {
			delete rule.portMax;
			return;
		}
		const x = parseInt(portMax, 10);
		if (isNaN(x)) {
			return;
		}

		rule.portMax = x;
	});

	$effect.pre(() => {
		if (prefix == '') {
			delete rule.prefix;
			return;
		}

		rule.prefix = prefix;
	});
</script>

<Select
	label="Network Direction"
	hint="Ingress allows traffic to the host, egress traffic from the host."
	bind:value={rule.direction}
>
	{#each Object.values(Region.NetworkDirection) as direction}
		<option value={direction}>{direction}</option>
	{/each}
</Select>

<Select label="Network Protocol" hint="OSI layer 3/4 protocol" bind:value={rule.protocol}>
	{#each Object.values(Region.NetworkProtocol) as protocol}
		<option value={protocol}>{protocol}</option>
	{/each}
</Select>

{#if isLayer4(rule.protocol)}
	<TextInput label="Port" hint="The start of the port range." bind:value={port} />

	<TextInput
		label="Port Range End"
		hint="The end of the port range, including this port number."
		bind:value={portMax}
	/>
{/if}

<TextInput
	label="Address Range"
	hint="Address range to allow access to the selected port.."
	bind:value={rule.prefix}
/>
