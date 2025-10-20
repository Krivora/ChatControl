import { asyncHandler } from "../utils/asyncHandler.js";
import { ContentsService } from "../services/contents.service.js";
import { ok } from "../utils/ApiResponse.js";

export const listContents = asyncHandler(async (req, res) => {
  const items = await ContentsService.list();
  return ok(res, items);
});

export const getContent = asyncHandler(async (req, res) => {
  const content = await ContentsService.get(req);
  return ok(res, content);
});

export const updateContent = asyncHandler(async (req, res) => {
  const content = await ContentsService.update(req);
  return ok(res, content);
});

