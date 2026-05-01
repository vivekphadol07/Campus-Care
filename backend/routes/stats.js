const router = require("express").Router();
const stats = require("../controllers/statsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, stats.overallStats);
router.get("/overall", verifyToken, stats.overallStats);
router.get("/student/:id", verifyToken, stats.studentStats);
router.get("/teacher/:id", verifyToken, stats.teacherStats);

module.exports = router;
