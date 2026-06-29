import path from 'path';
import dotenv from 'dotenv';
import { findTenantBySlug } from '../src/repositories/admin/tenantRepository';
import { provisionTenant } from '../src/services/tenantProvisioningService';

dotenv.config({ path: path.join(__dirname, '../.env') });

const DEMO_TENANTS = [
  {
    slug: 'peluqueria-naz',
    nombre: 'Peluquería Nazareno',
    plan: 'profesional' as const,
    page_status: 'ACTIVA' as const,
    gerente: {
      nombre: 'Admin Nazareno',
      email: 'admin@nazareno.local',
      password: 'Password123!',
    },
    seedDemoData: true,
  },
  {
    slug: 'estetica-luna',
    nombre: 'Estética Luna',
    plan: 'trial' as const,
    page_status: 'ACTIVA' as const,
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    gerente: {
      nombre: 'Luna Admin',
      email: 'luna@estetica.local',
      password: 'Password123!',
    },
    seedDemoData: true,
  },
];

async function main() {
  for (const tenant of DEMO_TENANTS) {
    const existing = await findTenantBySlug(tenant.slug);
    if (existing?.db_name) {
      console.log(`Tenant ${tenant.slug} ya provisionado — skip`);
      continue;
    }

    if (existing && !existing.db_name) {
      console.log(`Tenant ${tenant.slug} existe sin BD — usar reprovision desde super panel`);
      continue;
    }

    console.log(`Provisionando ${tenant.slug}...`);
    await provisionTenant(tenant, 1);
    console.log(`OK: ${tenant.slug}`);
  }
  console.log('Seed tenants demo completado.');
}

main().catch((err) => {
  console.error('Seed tenants failed:', err);
  process.exit(1);
});
