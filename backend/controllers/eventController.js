const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        const filters = req.query;
        const events = await Event.findAll(filters);
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'placement_cell') {
            return res.status(403).json({ message: "Access denied" });
        }
        const eventId = await Event.create({ ...req.body, created_by: req.user.id });
        res.status(201).json({ message: "Event created", id: eventId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const success = await Event.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const success = await Event.delete(req.params.id);
        if (!success) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
