const Leave = require("../models/Leave");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Attendance = require("../models/Attendance");
const { getDatesInRange } = require("../utils/dateUtils");

exports.applyLeave = async (req, res) => {
  const { student_id, start_date, end_date, reason } = req.body;
  const user = req.user;

  if (user.role === 'student' && String(user.id) !== String(student_id)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    await Leave.create({ student_id, start_date, end_date, reason });
    res.status(201).json({ message: "Leave applied" });
  } catch (err) {
    console.error("Apply Leave Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLeaves = async (req, res) => {
  const user = req.user;
  try {
    const filters = {};
    if (user.role === 'teacher') filters.class_id = req.user.class_id; // Wait, teacher needs their own class. 
    // Actually, leaveController.js original code used `c.class_teacher_id = ?`.

    let leaves;
    if (user.role === 'teacher') {
      // Need a way to find leaves for classes where teacher is class teacher
      // Original: JOIN students s ON l.student_id = s.id JOIN classes c ON s.class_id = c.id WHERE c.class_teacher_id = ?
      leaves = await Leave.findAll({ class_teacher_id: user.id }); // I should update Leave.findAll to support this.
    } else if (user.role === 'student') {
      leaves = await Leave.findAll({ student_id: user.id });
    } else {
      leaves = await Leave.findAll();
    }
    res.json(leaves);
  } catch (err) {
    console.error("Get Leaves Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;

  try {
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    if (user.role === 'teacher') {
      const student = await Student.findById(leave.student_id);
      const isClassTeacher = await Teacher.isClassTeacher(user.id, student.class_id);
      if (!isClassTeacher) return res.status(403).json({ error: "Unauthorized" });
    }

    await Leave.updateStatus(id, status);

    if (status === 'approved') {
      const student = await Student.findById(leave.student_id);
      const sessions = await Teacher.findAssignmentsByClass(student.class_id);
      const dates = getDatesInRange(leave.start_date, leave.end_date);

      for (const date of dates) {
        for (const session of sessions) {
          await Attendance.upsert({
            student_id: leave.student_id,
            date,
            status: 'leave',
            subject: session.subject,
            start_time: session.start_time,
            end_time: session.end_time
          });
        }
      }
    }

    res.json({ message: "Leave status updated" });
  } catch (err) {
    console.error("Update Leave Status Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteLeave = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM leaves WHERE id=?", [id]); // Keep simple for now or use model
    res.json({ message: "Leave deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLeaveById = async (req, res) => {
  const { id } = req.params;
  try {
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ error: "Leave not found" });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLeavesByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const leaves = await Leave.findAll({ student_id: id });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

