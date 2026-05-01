const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const { verifyToken: auth } = require('../middleware/authMiddleware');

const { upload } = require('../utils/cloudinary');

router.get('/dashboard', auth, placementController.getDashboardData);
router.get('/jobs', auth, placementController.getJobs);
router.post('/jobs', auth, placementController.createJob);
router.post('/apply', auth, placementController.applyForJob);
router.get('/applications', auth, placementController.getApplications);
router.put('/applications/:id/status', auth, placementController.updateApplicationStatus);
router.post('/upload-resume', auth, upload.single('resume'), placementController.uploadResume);

module.exports = router;
