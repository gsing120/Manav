import express from 'express';
import { FunctionController } from '../controllers/FunctionController';

const router = express.Router();
const functionController = new FunctionController();

// Get all available functions
router.get('/', functionController.getFunctions);

// Get specific function details
router.get('/:functionId', functionController.getFunctionById);

// Execute a function
router.post('/execute', functionController.executeFunction);

// Register a custom function
router.post('/register', functionController.registerFunction);

export default router;
