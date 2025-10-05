import bcrypt from 'bcryptjs';
import { UsersRepo } from '../repositories/users.repo.js';
import { parsePagination } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

export const UsersService = {

  async register(req) {
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      password,
      role_id // 👈 nuevo campo opcional
    } = req.body;

    const existing = await UsersRepo.getByEmail(email);
    if (existing) throw new ApiError(400, 'El email ya está registrado');

    const passwordHash = await bcrypt.hash(password, 10);

    // Si no se envía role_id, asigna “usuario” por defecto (por ejemplo, id=3)
    const defaultRoleId = 3;
    const finalRoleId = role_id || defaultRoleId;

    return UsersRepo.create({
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      passwordHash,
      role_id: finalRoleId
    });
  },

  async list(req) {
    const { limit, offset, page, pageSize } = parsePagination(req);
    const items = await UsersRepo.list({ limit, offset });
    const total = items.length; // Si no tienes COUNT separado
    return { items, meta: { page, pageSize, total } };
  },

  async get(req) {
    const { id } = req.params;
    const user = await UsersRepo.getById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');
    return user;
  },

  async login(req) {
    const { email, password } = req.body;
    const user = await UsersRepo.getByEmail(email);
    if (!user) throw new ApiError(401, 'Credenciales inválidas');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError(401, 'Credenciales inválidas');

    // 👇 Agregamos el role_id y role_name al token
    const token = signToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      role_id: user.role_id,
      role: user.role_name || 'usuario'
    });

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        darkMode: user.dark_mode,
        role_id: user.role_id,
        role: user.role_name
      },
      token
    };
  },

  async update(req) {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      password,
      role_id // 👈 permitir actualizar rol
    } = req.body;

    const user = await UsersRepo.getById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');

    // Verificar si cambió el email y si ya existe
    if (email && email !== user.email) {
      const existing = await UsersRepo.getByEmail(email);
      if (existing) throw new ApiError(400, 'El email ya está registrado');
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : user.password;

    return UsersRepo.update(id, {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      passwordHash,
      role_id
    });
  },

  async updateDarkMode(req) {
    const userId = req.user.id; // viene del token (requireAuth)
    const { darkMode } = req.body;

    if (typeof darkMode !== 'boolean') {
      throw new ApiError(400, 'darkMode debe ser booleano');
    }

    const updatedUser = await UsersRepo.updateDarkMode(userId, darkMode);
    return {
      id: updatedUser.id,
      darkMode: updatedUser.dark_mode
    };
  },

  async softDelete(req) {
    const { id } = req.params;
    const user = await UsersRepo.getById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');

    return UsersRepo.softDelete(id);
  }
};
