// src/controllers/assignments.controller.js
//
// Este era el único controller con try/catch manual: devolvía `{ data }` o
// `{ error }` en vez del `{ ok, data }` del resto de la API, y leía
// `err.statusCode` cuando ApiError expone `status`, así que todo error de
// negocio (un 404, un 409 de asignación duplicada) salía como 500.
import { asyncHandler } from '../utils/asyncHandler.js';
import { AssignmentsService } from '../services/assignments.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listAllAssignments = asyncHandler(async (req, res) => {
  const data = await AssignmentsService.listAll({ actor: req.user });
  return ok(res, data);
});

export const listAssignments = asyncHandler(async (req, res) => {
  const data = await AssignmentsService.list({
    conversationId: req.params.conversationId,
  });
  return ok(res, data);
});

export const getAssignment = asyncHandler(async (req, res) => {
  const data = await AssignmentsService.get({ id: req.params.id });
  return ok(res, data);
});

export const createAssignment = asyncHandler(async (req, res) => {
  const data = await AssignmentsService.create(req.body ?? {});
  return res.status(201).json({ ok: true, data });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const data = await AssignmentsService.update({
    id: req.params.id,
    data: req.body ?? {},
  });
  return ok(res, data);
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const data = await AssignmentsService.remove({ id: req.params.id });
  return ok(res, data);
});
