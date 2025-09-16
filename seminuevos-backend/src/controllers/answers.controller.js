// src/controllers/answers.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { AnswersService } from '../services/answers.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listAnswers = asyncHandler(async (req, res) => {
  const { items, meta } = await AnswersService.list(req);
  return ok(res, items, meta);
});

export const getAnswerByKey = asyncHandler(async (req, res) => {
  const answer = await AnswersService.get(req);
  return ok(res, answer);
});
