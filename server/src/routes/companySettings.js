import express from 'express';
import { 
  getCompanySettings, 
  updateCompanySettings,
  resetCompanySettings
} from '../controllers/companySettingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

router.get('/', getCompanySettings);
router.put('/', updateCompanySettings);
router.post('/reset', resetCompanySettings);

export default router;
