// src/controllers/answers.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { AnswersService } from '../services/answers.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listAnswers = asyncHandler(async (req, res) => {
  const { items, meta } = await AnswersService.list({
    conversationId: req.params.conversationId,
  });
  return ok(res, items, meta);
});

export const getAnswerByKey = asyncHandler(async (req, res) => {
  const answer = await AnswersService.get({
    conversationId: req.params.conversationId,
    key: req.params.key,
  });
  return ok(res, answer);
});
