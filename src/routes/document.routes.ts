import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireGNOrAdmin } from '../middleware/roleGuard';
import { uploadSingle } from '../utils/fileUpload';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Document upload and management
router.post('/upload', uploadLimiter, uploadSingle('document'), asyncHandler(DocumentController.uploadDocument));
router.get('/user', asyncHandler(DocumentController.getUserDocuments));
router.get('/application/:applicationId', asyncHandler(DocumentController.getDocuments));

// Digital signature routes
router.post('/sign', requireGNOrAdmin, asyncHandler(DocumentController.signDocument));
router.get('/:documentId/signed', requireGNOrAdmin, asyncHandler(DocumentController.getSignedDocument));
router.get('/:documentId/verify', requireGNOrAdmin, asyncHandler(DocumentController.verifySignature));

export default router;