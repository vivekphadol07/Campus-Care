const router = require("express").Router();
const leave = require("../controllers/leaveController");
const { verifyToken, isTeacherOrAdmin, isTeacher } = require("../middleware/authMiddleware");

router.post("/", verifyToken, leave.applyLeave);
router.get("/", verifyToken, leave.getLeaves);
router.put("/:id/status", verifyToken, isTeacherOrAdmin, leave.updateLeaveStatus);
router.delete("/:id", verifyToken, isTeacherOrAdmin, leave.deleteLeave);
router.get("/:id", verifyToken, isTeacherOrAdmin, leave.getLeaveById);
router.get("/:id/leaves", verifyToken, isTeacherOrAdmin, leave.getLeavesByUser);

module.exports = router;
