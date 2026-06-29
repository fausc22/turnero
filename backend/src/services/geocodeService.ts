import axios from 'axios';
import * as metaRepo from '../repositories/tenant/tenantMetaRepository';
import { AppError } from '../utils/errors';

export async function geocodeDireccion(): Promise<{
  lat: number;
  lng: number;
  formatted?: string;
}> {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const meta = await metaRepo.getTenantMeta();
  if (!meta?.direccion) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Ingresá una dirección primero');
  }

  if (!apiKey) {
    throw new AppError(503, 'GEOCODE_UNAVAILABLE', 'Geocoding no configurado (OPENCAGE_API_KEY)');
  }

  const url = `https://api.opencagedata.com/geocode/v1/json`;
  const { data } = await axios.get<{
    results: { geometry: { lat: number; lng: number }; formatted: string }[];
  }>(url, {
    params: { q: meta.direccion, key: apiKey, limit: 1, countrycode: 'ar' },
    timeout: 10000,
  });

  const result = data.results?.[0];
  if (!result) {
    throw new AppError(404, 'GEOCODE_NOT_FOUND', 'No se encontró la dirección');
  }

  const { lat, lng } = result.geometry;
  await metaRepo.updateTenantMeta({
    direccionLat: lat,
    direccionLng: lng,
  });

  return { lat, lng, formatted: result.formatted };
}
