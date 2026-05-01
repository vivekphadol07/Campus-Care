const router = require("express").Router();
const teacher = require("../controllers/teacherController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:id/assignments", verifyToken, teacher.getAssignments);
router.get("/:id/leaves", verifyToken, teacher.getLeaves);
router.get("/:id/attendance", verifyToken, teacher.getAttendance);
router.get("/:id/students", verifyToken, teacher.getStudents);
router.get("/:id/teachers", verifyToken, teacher.getTeachers);
router.get("/:id/classes", verifyToken, teacher.getClasses);
router.get("/:id/subjects", verifyToken, teacher.getSubjects);

module.exports = router;
