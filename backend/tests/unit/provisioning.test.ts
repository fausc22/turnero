import { createTenantSchema } from '../../src/utils/validations';
import { ZodError } from 'zod';

describe('provisioning validation', () => {
  const validInput = {
    slug: 'test-tenant',
    nombre: 'Test Tenant',
    plan: 'trial' as const,
    gerente: {
      nombre: 'Gerente Test',
      email: 'gerente@test.local',
      password: 'Password123!',
    },
  };

  it('acepta input válido', () => {
    const parsed = createTenantSchema.parse(validInput);
    expect(parsed.slug).toBe('test-tenant');
    expect(parsed.plan).toBe('trial');
  });

  it('rechaza slug inválido', () => {
    expect(() =>
      createTenantSchema.parse({ ...validInput, slug: 'INVALID SLUG!' })
    ).toThrow(ZodError);
  });

  it('rechaza email gerente inválido', () => {
    expect(() =>
      createTenantSchema.parse({
        ...validInput,
        gerente: { ...validInput.gerente, email: 'not-an-email' },
      })
    ).toThrow(ZodError);
  });

  it('rechaza password corto del gerente', () => {
    expect(() =>
      createTenantSchema.parse({
        ...validInput,
        gerente: { ...validInput.gerente, password: 'short' },
      })
    ).toThrow(ZodError);
  });
});
