const router = require("express").Router();
const profile = require("../controllers/profileController");
const { verifyToken } = require("../middleware/authMiddleware");
const { upload, imageUpload } = require("../utils/cloudinary");

router.post("/upload", verifyToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: req.file.path });
});

router.post("/profile-pic", verifyToken, imageUpload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    try {
        const Student = require("../models/Student");
        await Student.update(req.user.id, { profile_pic: req.file.path });
        res.json({ message: "Profile picture updated", url: req.file.path });
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile picture" });
    }
});

router.get("/:id", verifyToken, profile.getProfile);
router.put("/:id", verifyToken, profile.updateProfile);
router.post("/collection/:type", verifyToken, profile.addCollectionItem);
router.delete("/collection/:type/:id", verifyToken, profile.deleteCollectionItem);

// Admin only routes
router.get("/admin/requests", verifyToken, (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });
    next();
}, profile.getUpdateRequests);

router.post("/admin/handle-request", verifyToken, (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });
    next();
}, profile.handleUpdateRequest);

module.exports = router;
