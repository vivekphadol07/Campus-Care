const Class = require("../models/Class");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const bcrypt = require("bcrypt");

exports.createClass = async (req, res) => {
  const { name, semester, class_teacher_id } = req.body;
  if (!name) return res.status(400).json({ error: "Class name is required" });

  try {
    const id = await Class.create({ name, semester, class_teacher_id });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateClass = async (req, res) => {
  const { id } = req.params;
  const { name, semester, class_teacher_id } = req.body;
  try {
    await Class.update(id, { name, semester, class_teacher_id });
    res.json({ message: "Class updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    await Class.deleteTeacherAssignments(id);
    await Class.unlinkStudents(id);
    await Class.delete(id);
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.listWithTeacher();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createTeacher = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await Teacher.create({ name, email, password: hash, role });
    res.status(201).json({ message: "Teacher created" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    await Teacher.update(id, { name, email, role });
    res.json({ message: "Teacher updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    await Teacher.deleteAssignments(id);
    await Teacher.unlinkClasses(id);
    await Teacher.delete(id);
    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.assignSubject = async (req, res) => {
  try {
    await Teacher.assignSubject(req.body);
    res.json({ message: "Assigned" });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Invalid foreign key" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.json(teachers.filter(t => t.role === 'teacher'));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Teacher.listAssignments();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    await Teacher.deleteAssignmentById(id);
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

