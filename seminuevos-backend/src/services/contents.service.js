import { ContentsRepo } from "../repositories/contents.repo.js";

export const ContentsService = {

  async list() {
    return await ContentsRepo.list();
  },

  async get(req) {
    const { id } = req.params;
    const result = await ContentsRepo.getById(id);
    if (!result) throw new Error("Contenido no encontrado.");
    return result;
  },

  async update(req) {
    const { id } = req.params;
    const { name, type, content } = req.body;
    return await ContentsRepo.update(id, { name, type, content });
  },
};
