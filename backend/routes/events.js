const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken: auth } = require('../middleware/authMiddleware');

router.get('/', auth, eventController.getEvents);
router.post('/', auth, eventController.createEvent);
router.put('/:id', auth, eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
