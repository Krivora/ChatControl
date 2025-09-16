// src/utils/ApiResponse.js
export const ok = (res, data, meta = null) => {
  const payload = { ok: true, data };
  if (meta) payload.meta = meta;
  return res.json(payload);
};

export const fail = (res, status, message, details = null) => {
  return res.status(status).json({
    ok: false,
    message,
    details,
  });
};
