const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const bcrypt = require("bcrypt");

exports.getStudents = async (req, res) => {
  const user = req.user;
  try {
    const { class_id } = req.query;
    const filters = {};

    if (user.role === 'teacher') {
      if (class_id) {
        filters.class_id = class_id;
        filters.teacher_id = user.id;
      } else {
        filters.class_teacher_id = user.id;
      }
    } else if (class_id) {
      filters.class_id = class_id;
    }

    const students = await Student.findAll(filters);
    res.json(students);
  } catch (err) {
    console.error("Get Students Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createStudent = async (req, res) => {
  const { name, roll_number, email, class_id, password } = req.body;
  if (!name || !roll_number) return res.status(400).json({ error: "Missing required fields" });

  try {
    const rawPassword = password || roll_number;
    const hash = await bcrypt.hash(rawPassword, 10);

    await Student.create({
      name,
      roll_number,
      email,
      password: hash,
      class_id
    });

    res.status(201).json({ message: "Student created" });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Student creation failed: Invalid Class ID. Please ensure the class exists.",
        details: err.sqlMessage
      });
    }
    console.error("Create Student Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, class_id, password } = req.body;
  try {
    const updateData = { name, email, class_id };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await Student.update(id, updateData);
    res.json({ message: "Student updated" });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Student update failed: Invalid Class ID. Please ensure the class exists.",
        details: err.sqlMessage
      });
    }
    console.error("Update Student Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete associated records first
    await Attendance.deleteByStudent(id);
    await Leave.deleteByStudent(id);
    await Student.delete(id);

    res.json({ message: "Student and associated records deleted successfully" });
  } catch (err) {
    console.error("Delete Student Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error("Get Student By ID Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLeavesByStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const leaves = await Leave.findAll({ student_id: id });
    res.json(leaves);
  } catch (err) {
    console.error("Get Leaves By Student Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAttendanceByStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const attendance = await Attendance.findAll({ student_id: id });
    res.json(attendance);
  } catch (err) {
    console.error("Get Attendance By Student Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

