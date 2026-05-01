const router = require("express").Router();
const student = require("../controllers/studentController");
const { verifyToken, isTeacherOrAdmin, isTeacher, isClassTeacher } = require("../middleware/authMiddleware");

router.get("/", verifyToken, isTeacherOrAdmin, student.getStudents);
router.post("/", verifyToken, isClassTeacher, student.createStudent);
router.put("/:id", verifyToken, isClassTeacher, student.updateStudent);
router.delete("/:id", verifyToken, isClassTeacher, student.deleteStudent);
router.get("/:id", verifyToken, isTeacherOrAdmin, student.getStudentById);
router.get("/:id/leaves", verifyToken, isTeacherOrAdmin, student.getLeavesByStudent);
router.get("/:id/attendance", verifyToken, isTeacherOrAdmin, student.getAttendanceByStudent);

module.exports = router;
