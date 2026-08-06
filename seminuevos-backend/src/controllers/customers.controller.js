import { asyncHandler } from '../utils/asyncHandler.js';
import { CustomersService } from '../services/customers.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const { items, meta } = await CustomersService.list(req);
  return ok(res, items, meta);
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await CustomersService.get(req);
  return ok(res, customer); // ok() debe devolver { status: "ok", data: customer }
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await CustomersService.update(req);
  return ok(res, customer);
});
