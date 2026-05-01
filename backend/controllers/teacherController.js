const Teacher = require("../models/Teacher");

exports.getAssignments = async (req, res) => {
  const { id } = req.params;
  try {
    const subjects = await Teacher.getAssignments(id);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLeaves = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await Teacher.getLeavesByTeacher(id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await Teacher.getAttendanceByTeacher(id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getStudents = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await Teacher.getStudentsByTeacher(id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTeachers = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await Teacher.getPeerTeachers(id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getClasses = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await Teacher.getClassesByTeacher(id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSubjects = async (req, res) => {
  const { id } = req.params;
  try {
    const subjects = await Teacher.getSubjectsByTeacher(id);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

