jest.mock('axios', () => ({
  get: jest.fn(),
}));

import axios from 'axios';
import { geocodeDireccion } from '../../src/services/geocodeService';
import { updateTenantMeta } from '../../src/repositories/tenant/tenantMetaRepository';
import { withDemoTenant } from '../helpers/tenantContext';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('geocodeService', () => {
  const prevKey = process.env.OPENCAGE_API_KEY;

  afterEach(() => {
    process.env.OPENCAGE_API_KEY = prevKey;
    jest.clearAllMocks();
  });

  it('falla sin API key', async () => {
    delete process.env.OPENCAGE_API_KEY;
    await withDemoTenant(async () => {
      await updateTenantMeta({ direccion: 'Av. Corrientes 1234, CABA' });
      await expect(geocodeDireccion()).rejects.toMatchObject({
        code: 'GEOCODE_UNAVAILABLE',
      });
    });
  });

  it('geocodifica con API key mock', async () => {
    process.env.OPENCAGE_API_KEY = 'test-key';
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        results: [{ geometry: { lat: -34.6, lng: -58.4 }, formatted: 'Buenos Aires' }],
      },
    });
    await withDemoTenant(async () => {
      await updateTenantMeta({ direccion: 'Av. Corrientes 1234, CABA' });
      const result = await geocodeDireccion();
      expect(result.lat).toBe(-34.6);
      expect(result.lng).toBe(-58.4);
    });
  });
});
