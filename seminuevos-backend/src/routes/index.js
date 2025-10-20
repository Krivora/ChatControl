// src/routes/index.js
import { Router } from 'express';
import answers from './answers.routes.js';
import appointments from './appointments.routes.js';
import assignments from './assignments.routes.js';
import customers from './customers.routes.js';
import conversations from './conversations.routes.js';
import contents from './contents.routes.js';
import messagesRoutes from "./messages.routes.js";

import slots from './slots.routes.js';
import users from './users.routes.js';
import whatsapp from './whatsapp.routes.js';

const router = Router();

// De momento vacío, luego importamos las rutas de customers, users, etc.
router.get('/', (req, res) => {
  res.json({ ok: true, message: 'Bienvenido a la API 👋' });
});
 
router.use('/answers', answers);
router.use('/appointments', appointments);
router.use('/assignments', assignments);
router.use('/customers', customers);
router.use('/conversations', conversations);
router.use('/contents', contents);

router.use('/slots', slots);
router.use('/users', users);
router.use('/whatsapp', whatsapp);


export default router;
