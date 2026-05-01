const router = require("express").Router();
const { login, adminSignup } = require("../controllers/authController");

router.post("/login", login);
router.post("/admin-signup", adminSignup);

module.exports = router;
