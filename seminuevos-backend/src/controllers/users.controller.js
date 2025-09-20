// src/controllers/users.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { UsersService } from '../services/users.service.js';
import { ok } from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const user = await UsersService.register(req);
  return ok(res, user);
});

export const listUsers = asyncHandler(async (req, res) => {
  const { items, meta } = await UsersService.list(req);
  return ok(res, items, meta);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await UsersService.get(req);
  return ok(res, user);
});

export const login = asyncHandler(async (req, res) => {
  const data = await UsersService.login(req);
  return ok(res, data);
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await UsersService.register(req); // Puedes reutilizar register
  return ok(res, user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await UsersService.update(req);
  return ok(res, user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const deleted = await UsersService.softDelete(req);
  return ok(res, { message: "Usuario eliminado (softdelete)", deleted });
});

export const updateDarkMode = asyncHandler(async (req, res) => {
  const updated = await UsersService.updateDarkMode(req);
  return ok(res, updated);
});
