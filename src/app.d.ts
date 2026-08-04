// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { StaffSessionUser } from '$lib/server/auth/staff-auth';
import type { CustomerSessionUser } from '$lib/server/auth/customer-auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			staff: StaffSessionUser | null;
			customer: CustomerSessionUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
