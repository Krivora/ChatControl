import { ApiError } from '../utils/ApiError.js';

export const authorizeRole = (...rolesPermitidos) => {
  return (req, _res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(new ApiError(403, 'No autorizado: rol no encontrado'));
    }

    if (!rolesPermitidos.includes(userRole)) {
      return next(
        new ApiError(
          403,
          `Acceso denegado: se requiere uno de los siguientes roles [${rolesPermitidos.join(', ')}]`
        )
      );
    }

    next();
  };
};
