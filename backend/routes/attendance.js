const router = require("express").Router();
const attendance = require("../controllers/attendanceController");
const { verifyToken, isTeacherOrAdmin, isTeacher } = require("../middleware/authMiddleware");

router.get("/", verifyToken, attendance.getAttendance);
router.post("/", verifyToken, isTeacherOrAdmin, attendance.markAttendance);
router.put("/:id", verifyToken, isTeacherOrAdmin, attendance.updateAttendance);
router.delete("/:id", verifyToken, isTeacherOrAdmin, attendance.deleteAttendance);

module.exports = router;
