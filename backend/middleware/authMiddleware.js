const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader ? "Present" : "Missing");

  if (!authHeader) return res.status(403).json({ error: "No token" });

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("Token split failed or missing");
    return res.status(403).json({ error: "No token" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("CRITICAL: JWT_SECRET is not defined in process.env");
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error("JWT Verify Error:", err.message);
      return res.status(401).json({ error: "Invalid token" });
    }
    console.log("JWT Verified for user:", decoded.name, "(id:", decoded.id, ")");
    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Teacher only" });
  }
  next();
};

const isTeacherOrAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "teacher") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
};

const isClassTeacher = async (req, res, next) => {
  try {
    const { id } = req.params; // Student ID (for update/delete)
    const { class_id } = req.body; // Class ID (for create)
    const teacher_id = req.user.id;

    if (req.user.role === 'admin') return next();
    if (req.user.role !== 'teacher') return res.status(403).json({ error: "Teacher only" });

    // 1. If modifying an existing student, check if the teacher owns the CURRENT class
    if (id) {
      const [student] = await db.query("SELECT class_id FROM students WHERE id = ?", [id]);
      if (student.length === 0) return res.status(404).json({ error: "Student not found" });
      const current_class_id = student[0].class_id;

      if (current_class_id) {
        const [currentClass] = await db.query("SELECT class_teacher_id FROM classes WHERE id = ?", [current_class_id]);
        if (currentClass.length > 0 && currentClass[0].class_teacher_id !== teacher_id) {
          return res.status(403).json({ error: "You are not the class teacher of this student's current division." });
        }
      }
    }

    // 2. If creating or moving to a new class, check if the teacher owns the TARGET class
    if (class_id) {
      const [targetClass] = await db.query("SELECT class_teacher_id FROM classes WHERE id = ?", [class_id]);
      if (targetClass.length === 0) return res.status(404).json({ error: "Target class not found" });
      if (targetClass[0].class_teacher_id !== teacher_id) {
        return res.status(403).json({ error: "You are not the assigned Class Teacher for the target division." });
      }
    } else if (!id) {
      // New student must have a class_id and teacher must own it
      return res.status(400).json({ error: "Class ID is required for new students." });
    }

    next();
  } catch (err) {
    console.error("Middleware Error:", err);
    res.status(500).json({ error: "Server error in authorization" });
  }
};

module.exports = { verifyToken, isAdmin, isTeacher, isTeacherOrAdmin, isClassTeacher };
