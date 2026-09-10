// src/controllers/users.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { UsersService } from '../services/users.service.js';
import { parsePagination } from '../utils/pagination.js';
import { ok } from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const user = await UsersService.register(req.body ?? {});
  return ok(res, user);
});

// Alta desde el panel: mismo caso de uso que el alta pública.
export const createUser = register;

export const listUsers = asyncHandler(async (req, res) => {
  const { items, meta } = await UsersService.list(parsePagination(req.query));
  return ok(res, items, meta);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await UsersService.get({ id: req.params.id });
  return ok(res, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};
  const data = await UsersService.login({ email, password });
  return ok(res, data);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await UsersService.update({ id: req.params.id, data: req.body ?? {} });
  return ok(res, user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const deleted = await UsersService.softDelete({ id: req.params.id });
  return ok(res, { message: 'Usuario eliminado (softdelete)', deleted });
});

export const updateDarkMode = asyncHandler(async (req, res) => {
  const updated = await UsersService.updateDarkMode({
    userId: req.user.id,
    darkMode: req.body?.darkMode,
  });
  return ok(res, updated);
});
