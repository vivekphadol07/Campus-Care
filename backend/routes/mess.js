const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const { verifyToken: auth } = require('../middleware/authMiddleware');

router.get('/menu', auth, messController.getMenu);
router.get('/menu/upcoming', auth, messController.getUpcomingMenus);
router.post('/menu', auth, messController.addOrUpdateMenu);
router.post('/feedback', auth, messController.submitFeedback);
router.get('/feedback/summary', auth, messController.getFeedbackSummary);
router.get('/requests', auth, messController.getMealRequests);
router.post('/request', auth, messController.createMealRequest);
router.put('/requests/:id/status', auth, messController.updateMealRequestStatus);

module.exports = router;
