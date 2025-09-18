// src/services/conversations.service.js
import { ConversationsRepo } from "../repositories/conversations.repo.js";
import { parsePagination } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";

export const ConversationsService = {
  async list(req) {
    const { limit, offset, page, pageSize } = parsePagination(req);

    const [items, total] = await Promise.all([
      ConversationsRepo.listWithLastMessage({ limit, offset }),
      ConversationsRepo.count(),
    ]);

    return {
      items,
      meta: { page, pageSize, total },
    };
  },

  async getFull(req) {
    const { id } = req.params;
    const data = await ConversationsRepo.getFullById(id);
    return data;
  },
};
