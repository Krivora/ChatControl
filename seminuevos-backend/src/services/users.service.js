// src/services/users.service.js
import bcrypt from 'bcryptjs';
import { UsersRepo } from '../repositories/users.repo.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

// Rol por defecto de un alta sin `role_id`: "usuario".
const DEFAULT_ROLE_ID = 3;
const BCRYPT_ROUNDS = 10;

export const UsersService = {
  /**
   * @param {{ nombre, apellido, email, telefono, fecha_nacimiento,
   *           genero, password, role_id? }} data
   */
  async register(data) {
    const {
      nombre, apellido, email, telefono,
      fecha_nacimiento, genero, password, role_id,
    } = data;

    const existing = await UsersRepo.getByEmail(email);
    if (existing) throw new ApiError(400, 'El email ya está registrado');

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    return UsersRepo.create({
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      passwordHash,
      role_id: role_id || DEFAULT_ROLE_ID,
    });
  },

  /** @param {{ limit: number, offset: number, page: number, pageSize: number }} input */
  async list({ limit, offset, page, pageSize }) {
    // El total era items.length, o sea el tamaño de la página: el panel
    // calculaba mal el número de páginas y nunca pasaba de la primera.
    const [items, total] = await Promise.all([
      UsersRepo.list({ limit, offset }),
      UsersRepo.count(),
    ]);
    return { items, meta: { page, pageSize, total } };
  },

  /** @param {{ id: string|number }} input */
  async get({ id }) {
    const user = await UsersRepo.getById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');
    return user;
  },

  /** @param {{ email: string, password: string }} credentials */
  async login({ email, password }) {
    const user = await UsersRepo.getByEmail(email);
    if (!user) throw new ApiError(401, 'Credenciales inválidas');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError(401, 'Credenciales inválidas');

    const token = signToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      role_id: user.role_id,
      role: user.role_name || 'usuario',
    });

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        darkMode: user.dark_mode,
        role_id: user.role_id,
        role: user.role_name,
      },
      token,
    };
  },

  /** @param {{ id: string|number, data: object }} input */
  async update({ id, data }) {
    const { nombre, apellido, email, telefono, fecha_nacimiento, genero, password, role_id } = data;

    const user = await UsersRepo.getById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');

    // Sólo se comprueba el email si realmente cambió: si no, chocaría consigo mismo.
    if (email && email !== user.email) {
      const existing = await UsersRepo.getByEmail(email);
      if (existing) throw new ApiError(400, 'El email ya está registrado');
    }

    const passwordHash = password
      ? await bcrypt.hash(password, BCRYPT_ROUNDS)
      : user.password;

    return UsersRepo.update(id, {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      passwordHash,
      role_id,
    });
  },

  /**
   * El id sale del token, no de la petición: un usuario sólo cambia su propia
   * preferencia y no puede tocar la de otro pasando un id distinto.
   *
   * @param {{ userId: number, darkMode: boolean }} input
   */
  async updateDarkMode({ userId, darkMode }) {
    if (typeof darkMode !== 'boolean') {
      throw new ApiError(400, 'darkMode debe ser booleano');
    }

    const updated = await UsersRepo.updateDarkMode(userId, darkMode);
    return { id: updated.id, darkMode: updated.dark_mode };
  },

  /** @param {{ id: string|number }} input */
  async softDelete({ id }) {
    const user = await UsersRepo.getById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');
    return UsersRepo.softDelete(id);
  },
};
