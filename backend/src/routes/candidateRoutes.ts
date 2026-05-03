import { Router } from 'express';
import {
  addCandidateController,
  getCandidateByIdController,
  getCandidatesController,
} from '../presentation/controllers/candidateController';

const router = Router();

router.get('/', getCandidatesController);
router.get('/:id', getCandidateByIdController);
router.post('/', addCandidateController);

export default router;
