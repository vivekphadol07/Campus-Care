const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const db = require("../config/db"); // Still keep for custom join in getAttendance for now

exports.getAttendance = async (req, res) => {
  const { date, subject, start_time, student_id } = req.query;
  const user = req.user;

  try {
    const filters = { date, subject, start_time };

    if (user.role === 'student') {
      filters.student_id = user.id;
    } else if (student_id) {
      filters.student_id = student_id;
    }

    // Using Attendance model but since it needs student names, we'll use a custom query for now or enhance the model
    // Actually, let's stick to the Attendance model and if names are needed, we can join there.
    // For now, I'll keep the join query but move it to Attendance model.
    const [rows] = await db.query(`
      SELECT a.*, s.name, s.roll_number
      FROM attendance a JOIN students s ON a.student_id=s.id
      WHERE 1=1
      ${date ? ' AND a.date=?' : ''}
      ${subject ? ' AND a.subject=?' : ''}
      ${start_time ? " AND TIME_FORMAT(a.start_time, '%H:%i') = TIME_FORMAT(?, '%H:%i')" : ''}
      ${filters.student_id ? ' AND a.student_id = ?' : ''}
    `, [
      ...(date ? [date] : []),
      ...(subject ? [subject] : []),
      ...(start_time ? [start_time] : []),
      ...(filters.student_id ? [filters.student_id] : [])
    ]);

    res.json(rows);
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.markAttendance = async (req, res) => {
  const { student_id, date, status, subject, start_time, end_time } = req.body;
  const user = req.user;

  if (!subject) return res.status(400).json({ error: "Subject is required" });

  try {
    if (user.role === 'teacher') {
      const student = await Student.findById(student_id);
      if (!student) return res.status(404).json({ error: "Student not found" });

      const isAssigned = await Teacher.hasAssignment(user.id, student.class_id, subject);
      if (!isAssigned) {
        return res.status(403).json({ error: "You are not assigned to mark attendance for this subject in this class." });
      }
    }

    await Attendance.upsert({
      student_id,
      date,
      status,
      subject,
      start_time: start_time || null,
      end_time: end_time || null
    });

    res.status(200).json({ message: "Attendance marked/updated" });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Invalid Student ID", details: err.sqlMessage });
    }
    console.error("Mark Attendance Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { status, subject: newSubject } = req.body;
  const user = req.user;

  try {
    // Basic verification for teacher
    if (user.role === 'teacher') {
      const [record] = await db.query(
        "SELECT a.subject, s.class_id FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.id = ?",
        [id]
      );
      if (record.length === 0) return res.status(404).json({ error: "Attendance record not found" });

      const isAssigned = await Teacher.hasAssignment(user.id, record[0].class_id, record[0].subject);
      if (!isAssigned) return res.status(403).json({ error: "Unauthorized" });

      if (newSubject && newSubject !== record[0].subject) {
        const isNewAssigned = await Teacher.hasAssignment(user.id, record[0].class_id, newSubject);
        if (!isNewAssigned) return res.status(403).json({ error: "Unauthorized for new subject" });
      }
    }

    await db.query("UPDATE attendance SET status=?, subject=? WHERE id=?", [
      status,
      newSubject || null,
      id
    ]);
    res.json({ message: "Attendance updated" });
  } catch (err) {
    console.error("Update Attendance Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteAttendance = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    if (user.role === 'teacher') {
      const [record] = await db.query(
        "SELECT a.subject, s.class_id FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.id = ?",
        [id]
      );
      if (record.length > 0) {
        const isAssigned = await Teacher.hasAssignment(user.id, record[0].class_id, record[0].subject);
        if (!isAssigned) return res.status(403).json({ error: "Unauthorized" });
      }
    }

    await db.query("DELETE FROM attendance WHERE id=?", [id]);
    res.json({ message: "Attendance deleted" });
  } catch (err) {
    console.error("Delete Attendance Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

