import { Router } from 'express';
import { executeSearch } from '../controllers/searchController.js';

const router = Router();

// Endpoint de búsqueda principal con filtros dinámicos y caché
router.get('/search', executeSearch);

export default router;