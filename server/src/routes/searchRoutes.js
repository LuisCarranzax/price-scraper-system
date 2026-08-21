import { Router } from 'express';
import { executeSearch, getSuggestions } from '../controllers/searchController.js';

const router = Router();

router.get('/search', executeSearch);
router.get('/suggestions', getSuggestions);

export default router;