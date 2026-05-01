const Timetable = require('../models/Timetable');

exports.getTimetable = async (req, res) => {
    try {
        const { class_id, teacher_id } = req.query;
        const rows = await Timetable.findAll({ class_id, teacher_id });
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.addTimetableEntry = async (req, res) => {
    try {
        const { class_id, teacher_id, subject, day_of_week, start_time, end_time } = req.body;

        const isOverlapping = await Timetable.checkOverlap(class_id, day_of_week, start_time, end_time);
        if (isOverlapping) {
            return res.status(400).json({ error: "Time slot overlaps with an existing entry." });
        }

        await Timetable.create({ class_id, teacher_id, subject, day_of_week, start_time, end_time });
        res.json({ message: "Timetable entry added" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await Timetable.delete(id);
        res.json({ message: "Timetable entry deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher_id, subject, day_of_week, start_time, end_time } = req.body;

        await Timetable.update(id, { teacher_id, subject, day_of_week, start_time, end_time });
        res.json({ message: "Timetable entry updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

