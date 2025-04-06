import express from 'express';
import { ModelController } from '../controllers/ModelController';

const router = express.Router();
const modelController = new ModelController();

// Get all available models
router.get('/', modelController.getModels);

// Get specific model details
router.get('/:modelId', modelController.getModelById);

// Send a query to a model
router.post('/query', modelController.queryModel);

// Stream a response from a model
router.post('/stream', modelController.streamModelResponse);

export default router;
