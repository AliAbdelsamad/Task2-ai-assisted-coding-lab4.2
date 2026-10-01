import { Router } from 'express';
import {
  createEvaluation,
  getAllEvaluations,
  getEvaluation,
  getEvaluationSummary,
} from '../controllers/evaluationController.js';

const router = Router();

router.get('/summary', getEvaluationSummary);
router.get('/', getAllEvaluations);
router.get('/:id', getEvaluation);
router.post('/', createEvaluation);

export default router;
