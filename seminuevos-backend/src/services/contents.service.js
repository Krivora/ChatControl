// src/services/contents.service.js
import { ContentsRepo } from '../repositories/contents.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const ContentsService = {
  async list() {
    return ContentsRepo.list();
  },

  /** @param {{ id: string|number }} input */
  async get({ id }) {
    const result = await ContentsRepo.getById(id);
    // Un Error genérico sale como 500. Un contenido inexistente es un 404.
    if (!result) throw new ApiError(404, 'Contenido no encontrado');
    return result;
  },

  /** @param {{ id: string|number, name?: string, type?: string, content?: string }} input */
  async update({ id, name, type, content }) {
    // El UPDATE devuelve la fila con RETURNING, o undefined si no existe:
    // basta con mirar el resultado, sin una consulta previa de existencia.
    const updated = await ContentsRepo.update(id, { name, type, content });
    if (!updated) throw new ApiError(404, 'Contenido no encontrado');
    return updated;
  },
};
