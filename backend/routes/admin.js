const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

router.post("/classes", verifyToken, isAdmin, admin.createClass);
router.get("/classes", verifyToken, admin.getClasses);
router.put("/classes/:id", verifyToken, isAdmin, admin.updateClass);
router.delete("/classes/:id", verifyToken, isAdmin, admin.deleteClass);
router.post("/teachers", verifyToken, isAdmin, admin.createTeacher);
router.put("/teachers/:id", verifyToken, isAdmin, admin.updateTeacher);
router.delete("/teachers/:id", verifyToken, isAdmin, admin.deleteTeacher);
router.post("/assign-subject", verifyToken, isAdmin, admin.assignSubject);
router.delete("/assignments/:id", verifyToken, isAdmin, admin.deleteAssignment);
router.get("/teachers", verifyToken, isAdmin, admin.getTeachers);
router.get("/assignments", verifyToken, isAdmin, admin.getAssignments);
router.get("/students", verifyToken, isAdmin, admin.getStudents);

module.exports = router;
