import { comparePassword } from '../utils/password';
import { UnauthorizedError, NotFoundError, AppError } from '../utils/errors';
import { globalLoginSchema } from '../utils/validations';
import { findByEmail as findIndexByEmail } from './tenantUserIndexService';
import { findTenantBySlug } from '../repositories/admin/tenantRepository';
import { findUsuarioByEmail, findUsuarioById } from '../repositories/tenant/usuarioRepository';
import { runWithTenantContext } from '../context/tenantContext';
import {
  buildTenantPayload,
  generateTenantAccessToken,
  generateTenantRefreshToken,
  verifyTenantRefreshToken,
} from '../utils/tenantJwt';

export class TenantAuthService {
  async login(email: string, password: string, rememberMe = false) {
    const validated = globalLoginSchema.parse({ email, password, rememberMe });
    const index = await findIndexByEmail(validated.email);
    if (!index) {
      throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const tenant = await findTenantBySlug(index.tenant_slug);
    if (!tenant || tenant.status !== 'activo' || !tenant.db_name) {
      throw new UnauthorizedError('Tenant no disponible', 'TENANT_NOT_AVAILABLE');
    }

    if (
      tenant.plan === 'trial' &&
      tenant.trial_ends_at &&
      new Date(tenant.trial_ends_at) < new Date()
    ) {
      throw new AppError(403, 'TRIAL_EXPIRED', 'El período de prueba expiró. Contactá al administrador.');
    }

    const usuario = await runWithTenantContext(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantDbName: tenant.db_name,
        plan: tenant.plan,
        pageStatus: tenant.page_status,
        config: tenant.config_json ?? {},
      },
      () => findUsuarioByEmail(validated.email)
    );

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const match = await comparePassword(validated.password, usuario.password_hash);
    if (!match) {
      throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const jwtPayload = buildTenantPayload(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      { id: tenant.id, slug: tenant.slug }
    );

    return {
      token: generateTenantAccessToken(jwtPayload),
      refreshToken: generateTenantRefreshToken(jwtPayload, rememberMe ?? false),
      tenantSlug: tenant.slug,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        onboardingCompletado: Boolean(usuario.onboarding_completado),
      },
    };
  }

  async refresh(refreshToken: string, tenantSlug: string) {
    const payload = verifyTenantRefreshToken(refreshToken);
    if (payload.tenant_slug !== tenantSlug) {
      throw new UnauthorizedError('Token no corresponde al tenant', 'TENANT_MISMATCH');
    }

    const tenant = await findTenantBySlug(tenantSlug);
    if (!tenant || !tenant.db_name) {
      throw new NotFoundError('Tenant');
    }

    const usuario = await runWithTenantContext(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantDbName: tenant.db_name,
        plan: tenant.plan,
        pageStatus: tenant.page_status,
        config: tenant.config_json ?? {},
      },
      () => findUsuarioById(payload.sub)
    );

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Usuario no válido');
    }

    const jwtPayload = buildTenantPayload(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      { id: tenant.id, slug: tenant.slug }
    );

    return {
      token: generateTenantAccessToken(jwtPayload),
      refreshToken: generateTenantRefreshToken(jwtPayload),
    };
  }

  async me(usuarioId: number) {
    const usuario = await findUsuarioById(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuario');
    }
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      profesionalId: usuario.profesional_id,
      onboardingCompletado: Boolean(usuario.onboarding_completado),
    };
  }

  async completeOnboarding(usuarioId: number) {
    const { markOnboardingComplete } = await import('../repositories/tenant/usuarioRepository');
    await markOnboardingComplete(usuarioId);
    return this.me(usuarioId);
  }
}

export const tenantAuthService = new TenantAuthService();
