// src/routes/index.js
import { Router } from 'express';
import answers from './answers.routes.js';
import appointments from './appointments.routes.js';
import assignments from './assignments.routes.js';
import customers from './customers.routes.js';
import conversations from './conversations.routes.js';
import messages from './messages.routes.js';
import slots from './slots.routes.js';
import users from './users.routes.js';

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
router.use('/messages', messages);
router.use('/slots', slots);
router.use('/users', users);


export default router;
