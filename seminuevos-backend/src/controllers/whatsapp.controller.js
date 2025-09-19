import { asyncHandler } from "../utils/asyncHandler.js";
import { WhatsAppService } from "../services/whatsapp.service.js";
import { ok } from "../utils/ApiResponse.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { to, body } = req.body;

  if (!to || !body) {
    return res.status(400).json({ message: "Faltan campos: 'to' y 'body'" });
  }

  const result = await WhatsAppService.sendTextMessage(to, body);
  return ok(res, result);
});
