const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, timetableController.getTimetable);
router.post('/', verifyToken, isAdmin, timetableController.addTimetableEntry);
router.put('/:id', verifyToken, isAdmin, timetableController.updateTimetableEntry);
router.delete('/:id', verifyToken, isAdmin, timetableController.deleteTimetableEntry);

module.exports = router;
