import { TenantRepository } from '../repositories/TenantRepository';

const repo = new TenantRepository();

export class TenantService {
    async getAllTenants() {
        return repo.findAll();
    }

    async getTenant(id: string) {
        return repo.findById(id);
    }

    async registerTenant(data: any) {
        // Business logic: check limits, provision, etc.
        return repo.createTenant({
            name: data.name,
            subdomain: data.subdomain,
            currency: data.currency || 'USD',
            timezone: data.timezone || 'UTC'
        });
    }
}
