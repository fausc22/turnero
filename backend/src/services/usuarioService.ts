import { usuarioRepository } from '../repositories/usuarioRepository';
import { hashPassword } from '../utils/password';
import { NotFoundError, ConflictError } from '../utils/errors';
import { createUsuarioSchema, updateUsuarioSchema } from '../utils/validations';
import { Usuario } from '../types';

class UsuarioService {
  async findAll(barberiaId?: number): Promise<Usuario[]> {
    return usuarioRepository.findAll(barberiaId);
  }

  async findById(id: number): Promise<Usuario> {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError('Usuario');
    }
    return usuario;
  }

  async create(data: unknown): Promise<Usuario> {
    const validated = createUsuarioSchema.parse(data);

    const existing = await usuarioRepository.findByEmail(validated.email);
    if (existing) {
      throw new ConflictError('Ya existe un usuario con ese email');
    }

    const password_hash = await hashPassword(validated.password);

    const id = await usuarioRepository.create({
      ...validated,
      password_hash
    });

    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Error al crear usuario');
    }

    return usuario;
  }

  async update(id: number, data: unknown): Promise<Usuario> {
    const validated = updateUsuarioSchema.parse(data);

    const existing = await usuarioRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Usuario');
    }

    if (validated.email && validated.email !== existing.email) {
      const emailExists = await usuarioRepository.findByEmail(validated.email);
      if (emailExists) {
        throw new ConflictError('Ya existe un usuario con ese email');
      }
    }

    const updateData: any = { ...validated };
    if (validated.password) {
      updateData.password_hash = await hashPassword(validated.password);
      delete updateData.password;
    }

    await usuarioRepository.update(id, updateData);
    const updated = await usuarioRepository.findById(id);
    
    if (!updated) {
      throw new Error('Error al actualizar usuario');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    await usuarioRepository.delete(id);
  }
}

export const usuarioService = new UsuarioService();

