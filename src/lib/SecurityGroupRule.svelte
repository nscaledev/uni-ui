<script lang="ts">
	import * as Region from '$lib/openapi/region';
	import Select from '$lib/forms/Select.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import * as Validators from '$lib/validation';

	interface Props {
		// rule is the object we are filling in.
		rule: Region.SecurityGroupRule;
		// valid if the all field validators resolve to true.
		valid?: boolean;
	}

	let { rule = $bindable(), valid = $bindable(false) }: Props = $props();

	let range: boolean = $state(Boolean(rule.port && rule.port.range));

	function updateRange(e: { checked: boolean }) {
		range = e.checked;
	}

	function initialPort(rule: Region.SecurityGroupRule): string {
		if (!rule.port) return '';

		if (rule.port.number) return rule.port.number.toString();

		if (rule.port.range) return rule.port.range.start.toString();

		return '';
	}

	function initialPortMax(rule: Region.SecurityGroupRule): string {
		if (!rule.port || !rule.port.range) return '';

		return rule.port.range.end.toString();
	}

	let port: string = $state(initialPort(rule));
	let portValid: boolean = $state(false);

	let portMax: string = $state(initialPortMax(rule));
	let portMaxValid: boolean = $state(false);

	$effect.pre(() => {
		if (range) {
			valid = portValid && portMaxValid;
			return;
		}

		valid = portValid;
	});

	$effect.pre(() => {
		const x = parseInt(port, 10);
		if (isNaN(x)) {
			return;
		}

		if (!range) {
			rule.port = {
				number: x
			};

			return;
		}

		const y = parseInt(portMax, 10);
		if (isNaN(y)) {
			return;
		}

		rule.port = {
			range: {
				start: x,
				end: y
			}
		};
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

<Select label="Network Protocol" hint="OSI layer 4 transport protocol" bind:value={rule.protocol}>
	{#each Object.values(Region.NetworkProtocol) as protocol}
		<option value={protocol}>{protocol}</option>
	{/each}
</Select>

<Switch
	name="use-range"
	label="Define a Port Range"
	hint="When selected a range of ports can be specified, rather than a single one"
	initial={range}
	onCheckedChange={updateRange}
/>

{#if range}
	<TextInput
		label="Port"
		hint="The start of the port range."
		bind:value={port}
		bind:valid={portValid}
		validators={[Validators.stringInt]}
	/>

	<TextInput
		label="Port Range End"
		hint="The end of the port range, including this port number."
		bind:value={portMax}
		bind:valid={portMaxValid}
		validators={[Validators.stringInt]}
	/>
{:else}
	<TextInput
		label="Port"
		hint="Port number."
		bind:value={port}
		bind:valid={portValid}
		validators={[Validators.stringInt]}
	/>
{/if}

<TextInput
	label="Address Range"
	hint="Address range to allow access to the selected port.  0.0.0.0/0 allows traffic from any host."
	bind:value={rule.cidr}
/>
