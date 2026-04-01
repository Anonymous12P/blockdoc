const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const documentController = require('../controllers/documentController');

router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.get('/check/:doc_id', documentController.checkDocumentIntegrity);
router.get('/user/:user_id', documentController.getUserDocuments);
router.get('/blockchain', documentController.getBlockchainData);
router.get('/activity/:user_id', documentController.getActivityLogs);
router.get('/dashboard/:user_id', documentController.getDashboardStats);

module.exports = router;