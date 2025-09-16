// src/controllers/assignments.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { AssignmentsService } from '../services/assignments.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listAssignments = asyncHandler(async (req, res) => {
  const items = await AssignmentsService.list(req);
  return ok(res, items);
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await AssignmentsService.get(req);
  return ok(res, assignment);
});

export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await AssignmentsService.create(req);
  return ok(res, assignment);
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await AssignmentsService.update(req);
  return ok(res, assignment);
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const result = await AssignmentsService.remove(req);
  return ok(res, result);
});
