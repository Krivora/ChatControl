// src/controllers/customers.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { CustomersService } from '../services/customers.service.js';
import { parsePagination } from '../utils/pagination.js';
import { ok } from '../utils/ApiResponse.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const { items, meta } = await CustomersService.list({
    ...parsePagination(req.query),
    q: req.query.q?.trim() || null,
  });
  return ok(res, items, meta);
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await CustomersService.get({ id: req.params.id });
  return ok(res, customer);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await CustomersService.update({
    id: req.params.id,
    fullName: req.body?.full_name,
  });
  return ok(res, customer);
});
