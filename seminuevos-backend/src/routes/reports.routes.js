// src/routes/reports.routes.js
import { Router } from 'express';
import {
  getOverview,
  getDataset,
  getDatasetTypes,
} from '../controllers/reports.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const r = Router();

// Los reportes cruzan la operación de todos los asesores, así que quedan
// restringidos igual que el menú de administración del panel.
const onlyAdmins = [requireAuth, authorizeRole('admin', 'super_admin')];

// GET /api/reports/overview?from=2025-01-01&to=2025-01-31&granularity=day
r.get('/overview', ...onlyAdmins, getOverview);

// GET /api/reports/datasets  -> catálogo de reportes exportables
r.get('/datasets', ...onlyAdmins, getDatasetTypes);

// GET /api/reports/dataset?type=leads&from=&to=&q=&page=&pageSize=
r.get('/dataset', ...onlyAdmins, getDataset);

export default r;
