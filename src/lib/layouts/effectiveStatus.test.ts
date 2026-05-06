import { describe, it, expect } from 'vitest';
import { resolveChip, fromPowerState, fromHealthStatus, fromUserState } from './effectiveStatus';

// Use string literals matching the enums rather than importing openapi types,
// so the tests stay decoupled from generated code changes.

describe('resolveChip', () => {
	it('returns null for unknown provisioning status', () => {
		expect(resolveChip('unknown' as never, null)).toBeNull();
	});

	it('returns null for undefined provisioning status', () => {
		expect(resolveChip(undefined, null)).toBeNull();
	});

	it('returns error chip for error provisioning status', () => {
		expect(resolveChip('error' as never, null)).toEqual({ label: 'error', chipClass: 'err' });
	});

	it('returns info chip for provisioning status', () => {
		expect(resolveChip('provisioning' as never, null)).toEqual({
			label: 'provisioning',
			chipClass: 'info'
		});
	});

	it('returns info chip for pending status', () => {
		expect(resolveChip('pending' as never, null)).toEqual({ label: 'pending', chipClass: 'info' });
	});

	it('returns warn chip for deprovisioning status', () => {
		expect(resolveChip('deprovisioning' as never, null)).toEqual({
			label: 'deprovisioning',
			chipClass: 'warn'
		});
	});

	it('returns provisioned chip when provisioned and no operational status', () => {
		expect(resolveChip('provisioned' as never, null)).toEqual({
			label: 'provisioned',
			chipClass: 'ok'
		});
	});

	it('returns operational status chip when provisioned and operational status provided', () => {
		const op = { label: 'running', chipClass: 'ok' as const };
		expect(resolveChip('provisioned' as never, op)).toEqual(op);
	});

	it('operational status is ignored when not yet provisioned', () => {
		const op = { label: 'running', chipClass: 'ok' as const };
		expect(resolveChip('provisioning' as never, op)).toEqual({
			label: 'provisioning',
			chipClass: 'info'
		});
	});

	it('operational status is ignored on error', () => {
		const op = { label: 'running', chipClass: 'ok' as const };
		expect(resolveChip('error' as never, op)).toEqual({ label: 'error', chipClass: 'err' });
	});
});

describe('fromPowerState', () => {
	it('Running → ok', () => {
		expect(fromPowerState('Running' as never)).toEqual({ label: 'running', chipClass: 'ok' });
	});

	it('Stopped → muted', () => {
		expect(fromPowerState('Stopped' as never)).toEqual({ label: 'stopped', chipClass: 'muted' });
	});

	it('Stopping → warn', () => {
		expect(fromPowerState('Stopping' as never)).toEqual({ label: 'stopping', chipClass: 'warn' });
	});

	it('Pending → info', () => {
		expect(fromPowerState('Pending' as never)).toEqual({ label: 'pending', chipClass: 'info' });
	});

	it('undefined → null', () => {
		expect(fromPowerState(undefined)).toBeNull();
	});
});

describe('fromHealthStatus', () => {
	it('healthy → ok', () => {
		expect(fromHealthStatus('healthy' as never)).toEqual({ label: 'healthy', chipClass: 'ok' });
	});

	it('degraded → warn', () => {
		expect(fromHealthStatus('degraded' as never)).toEqual({
			label: 'degraded',
			chipClass: 'warn'
		});
	});

	it('error → err', () => {
		expect(fromHealthStatus('error' as never)).toEqual({ label: 'error', chipClass: 'err' });
	});

	it('unknown → null', () => {
		expect(fromHealthStatus('unknown' as never)).toBeNull();
	});

	it('undefined → null', () => {
		expect(fromHealthStatus(undefined)).toBeNull();
	});
});

describe('fromUserState', () => {
	it('active → ok', () => {
		expect(fromUserState('active' as never)).toEqual({ label: 'active', chipClass: 'ok' });
	});

	it('pending → info', () => {
		expect(fromUserState('pending' as never)).toEqual({ label: 'pending', chipClass: 'info' });
	});

	it('suspended → err', () => {
		expect(fromUserState('suspended' as never)).toEqual({ label: 'suspended', chipClass: 'err' });
	});

	it('undefined → null', () => {
		expect(fromUserState(undefined)).toBeNull();
	});
});
