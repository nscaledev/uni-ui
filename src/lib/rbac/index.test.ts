import { describe, it, expect } from 'vitest';
import { organizationScopesAllowed } from './index';
import type { Acl } from '$lib/openapi/identity';
import { AclOperation } from '$lib/openapi/identity';

const ORG_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const OTHER_ORG_ID = 'b1ffcd00-ad1c-5fg9-cc7e-7cc0ce491b22';
const ENDPOINT = 'identity:users';

function makeAcl(overrides: Partial<Acl> = {}): Acl {
	return { global: undefined, organizations: undefined, ...overrides };
}

describe('organizationScopesAllowed', () => {
	it('returns true when scopes list is empty', () => {
		const acl = makeAcl();
		expect(organizationScopesAllowed(acl, ORG_ID, [])).toBe(true);
	});

	it('returns true when endpoint is in global ACL with required operation', () => {
		const acl = makeAcl({
			global: [{ name: ENDPOINT, operations: [AclOperation.Read] }]
		});
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Read] }
			])
		).toBe(true);
	});

	it('returns false when global endpoint exists but operation does not match', () => {
		const acl = makeAcl({
			global: [{ name: ENDPOINT, operations: [AclOperation.Read] }]
		});
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Update] }
			])
		).toBe(false);
	});

	it('returns true when endpoint is in the matching organization ACL', () => {
		const acl = makeAcl({
			organizations: [
				{
					id: ORG_ID,
					endpoints: [{ name: ENDPOINT, operations: [AclOperation.Read] }]
				}
			]
		});
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Read] }
			])
		).toBe(true);
	});

	it('returns false when endpoint is in a different organization', () => {
		const acl = makeAcl({
			organizations: [
				{
					id: OTHER_ORG_ID,
					endpoints: [{ name: ENDPOINT, operations: [AclOperation.Read] }]
				}
			]
		});
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Read] }
			])
		).toBe(false);
	});

	it('returns true when endpoint is in a project within the matching organization', () => {
		const acl = makeAcl({
			organizations: [
				{
					id: ORG_ID,
					projects: [
						{
							id: 'c2aaed11-be2d-6gh0-dd8f-8dd1df502c33',
							endpoints: [{ name: ENDPOINT, operations: [AclOperation.Read] }]
						}
					]
				}
			]
		});
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Read] }
			])
		).toBe(true);
	});

	it('returns false when no ACL entries exist', () => {
		const acl = makeAcl();
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Read] }
			])
		).toBe(false);
	});

	it('returns false when only one of multiple required scopes is satisfied', () => {
		const acl = makeAcl({
			global: [{ name: ENDPOINT, operations: [AclOperation.Read] }]
		});
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Read] },
				{ endpoint: 'identity:groups', operations: [AclOperation.Read] }
			])
		).toBe(false);
	});

	it('requires all operations to be present on the endpoint', () => {
		const acl = makeAcl({
			global: [{ name: ENDPOINT, operations: [AclOperation.Read] }]
		});
		expect(
			organizationScopesAllowed(acl, ORG_ID, [
				{ endpoint: ENDPOINT, operations: [AclOperation.Read, AclOperation.Update] }
			])
		).toBe(false);
	});
});
