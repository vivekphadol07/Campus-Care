const MessMenu = require('../models/MessMenu');
const MessFeedback = require('../models/MessFeedback');
const MealRequest = require('../models/MealRequest');

exports.getMenu = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: "Date is required" });
        const menu = await MessMenu.findByDate(date);
        res.json(menu || { breakfast: "", lunch: "", dinner: "" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUpcomingMenus = async (req, res) => {
    try {
        const menus = await MessMenu.getUpcoming(7);
        res.json(menus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addOrUpdateMenu = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'mess_owner') {
            return res.status(403).json({ message: "Access denied" });
        }
        const { date, breakfast, lunch, dinner } = req.body;
        await MessMenu.createOrUpdate({
            date,
            breakfast: breakfast,
            lunch: lunch,
            dinner: dinner,
            added_by: req.user.id
        });
        res.json({ message: "Menu updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.submitFeedback = async (req, res) => {
    try {
        const { rating, comment, meal_type, date } = req.body;
        const feedbackId = await MessFeedback.create({
            user_id: req.user.id,
            user_type: req.user.role === 'student' ? 'student' : 'teacher',
            rating,
            comment,
            meal_type,
            date
        });
        res.status(201).json({ message: "Feedback submitted", id: feedbackId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getFeedbackSummary = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'mess_owner') {
            return res.status(403).json({ message: "Access denied" });
        }
        const summary = await MessFeedback.getSummary();
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createMealRequest = async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ message: "Only students can request room delivery" });
        const { room_number, reason, meal_type, request_date } = req.body;
        const id = await MealRequest.create({
            student_id: req.user.id,
            room_number,
            reason,
            meal_type,
            request_date
        });
        res.status(201).json({ message: "Room delivery request submitted", id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMealRequests = async (req, res) => {
    try {
        const filters = { ...req.query };
        
        // If student, force filter to their own ID
        if (req.user.role === 'student') {
            filters.student_id = req.user.id;
        } else if (req.user.role !== 'admin' && req.user.role !== 'mess_owner') {
            return res.status(403).json({ message: "Access denied" });
        }

        const requests = await MealRequest.findAll(filters);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateMealRequestStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'mess_owner') {
            return res.status(403).json({ message: "Access denied" });
        }
        const { status } = req.body;
        await MealRequest.updateStatus(req.params.id, status);
        res.json({ message: "Request status updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
