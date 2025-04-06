import express from 'express';
import { Request, Response } from 'express';
import { MultimodalUnderstandingModule, ImageAnalysisResult } from '../multimodal/MultimodalUnderstandingModule';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';

// Create multimodal understanding module
const multimodalModule = new MultimodalUnderstandingModule();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * MultimodalController provides HTTP endpoints for multimodal understanding capabilities
 */
export class MultimodalController {
  /**
   * Process an image and extract information
   */
  processImage = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if module is initialized
      if (!multimodalModule.isReady()) {
        await multimodalModule.initialize();
      }
      
      // Get image path from request
      const imagePath = req.file?.path;
      
      if (!imagePath) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }
      
      // Process the image
      const result = await multimodalModule.processImage(imagePath);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  };

  /**
   * Check if the multimodal module is ready
   */
  checkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = multimodalModule.isReady();
      
      res.status(200).json({
        status: isReady ? 'ready' : 'initializing',
        message: isReady ? 'Multimodal understanding module is ready' : 'Multimodal understanding module is initializing'
      });
    } catch (error) {
      console.error('Error checking multimodal module status:', error);
      res.status(500).json({ error: 'Failed to check multimodal module status' });
    }
  };
}

// Create controller
const multimodalController = new MultimodalController();

// Create router
const router = express.Router();

// Multimodal routes
router.get('/status', multimodalController.checkStatus);
router.post('/process-image', upload.single('image'), multimodalController.processImage);

export default router;
