const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  let { email, password, role } = req.body;
  email = email?.trim();
  password = password?.trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  let user;
  if (role === "student") {
    user = await Student.findByEmailOrRoll(email);
  } else {
    user = await Teacher.findByEmail(email);
  }

  if (!user) {
    console.log(`Login failed for identifier: ${email}`);
    return res.status(401).json({ error: "Invalid login" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    console.log(`Login failed for identifier: ${email} (password mismatch)`);
    return res.status(401).json({ error: "Invalid login" });
  }

  const effectiveRole = role === "student" ? "student" : user.role;
  const tokenPayload = { id: user.id, role: effectiveRole, name: user.name };
  if (role === 'student') tokenPayload.class_id = user.class_id;

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  res.json({ token, role: effectiveRole, name: user.name, id: user.id, class_id: user.class_id });
};


exports.adminSignup = async (req, res) => {
  let { name, email, password, accessToken } = req.body;
  name = name?.trim();
  email = email?.trim();
  password = password?.trim();

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (accessToken !== process.env.ADMIN_SIGNUP_TOKEN) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  console.log("Admin Signup attempt for:", email);
  try {
    const [existing] = await db.query("SELECT * FROM teachers WHERE email=?", [email]);
    if (existing.length) return res.status(400).json({ error: "Admin already exists" });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO teachers (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hash, "admin"]
    );

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Signup Error Details:", err);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
};
