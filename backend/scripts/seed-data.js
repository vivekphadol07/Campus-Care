require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");

(async () => {
  try {
    console.log("🌱 Seeding sample data...");

    // 1. Create Staff with new roles
    const hashedPass = await bcrypt.hash("password123", 10);
    
    // Check/Create Mess Owner
    const [messOwner] = await db.query("SELECT * FROM teachers WHERE email=?", ["mess@college.com"]);
    let messOwnerId;
    if (messOwner.length === 0) {
        const [res] = await db.query(
            "INSERT INTO teachers (name, email, password, role) VALUES (?, ?, ?, ?)",
            ["Chef Ranveer", "mess@college.com", hashedPass, "mess_owner"]
        );
        messOwnerId = res.insertId;
    } else {
        messOwnerId = messOwner[0].id;
    }

    // Check/Create Placement Cell
    const [placementCell] = await db.query("SELECT * FROM teachers WHERE email=?", ["placement@college.com"]);
    let placementCellId;
    if (placementCell.length === 0) {
        const [res] = await db.query(
            "INSERT INTO teachers (name, email, password, role) VALUES (?, ?, ?, ?)",
            ["Officer Sharma", "placement@college.com", hashedPass, "placement_cell"]
        );
        placementCellId = res.insertId;
    } else {
        placementCellId = placementCell[0].id;
    }

    // Get an Admin for events
    const [adminUser] = await db.query("SELECT id FROM teachers WHERE role='admin' LIMIT 1");
    const adminId = adminUser[0].id;

    // Get a Student for feedback/apps
    const [studentUser] = await db.query("SELECT id FROM students LIMIT 1");
    if (studentUser.length === 0) {
        console.log("⚠️ No students found. Creating a test student...");
        const [res] = await db.query(
            "INSERT INTO students (name, roll_number, email, password) VALUES (?, ?, ?, ?)",
            ["Test Student", "ROLL101", "student@test.com", hashedPass]
        );
        studentUser.push({ id: res.insertId });
    }
    const studentId = studentUser[0].id;

    // 2. Seed Mess Menu (Today and Tomorrow)
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await db.query("INSERT IGNORE INTO mess_menu (date, breakfast, lunch, dinner, added_by) VALUES (?, ?, ?, ?, ?)", [
        today,
        JSON.stringify(["Poha", "Tea", "Banana"]),
        JSON.stringify(["Rice", "Dal Tadka", "Paneer Butter Masala", "Roti", "Salad"]),
        JSON.stringify(["Aloo Gobhi", "Daal Fry", "Roti", "Rice", "Gulab Jamun"]),
        messOwnerId
    ]);

    await db.query("INSERT IGNORE INTO mess_menu (date, breakfast, lunch, dinner, added_by) VALUES (?, ?, ?, ?, ?)", [
        tomorrow,
        JSON.stringify(["Idli", "Sambar", "Coffee"]),
        JSON.stringify(["Veg Biryani", "Raita", "Papad", "Ice Cream"]),
        JSON.stringify(["Mix Veg", "Paratha", "Dal", "Curd"]),
        messOwnerId
    ]);

    // 3. Seed Mess Feedback
    await db.query("INSERT IGNORE INTO mess_feedback (user_id, user_type, rating, comment, meal_type, date) VALUES (?, ?, ?, ?, ?, ?)", [
        studentId, 'student', 5, "Paneer was excellent today! Really loved the spice level.", "lunch", today
    ]);
    await db.query("INSERT IGNORE INTO mess_feedback (user_id, user_type, rating, comment, meal_type, date) VALUES (?, ?, ?, ?, ?, ?)", [
        studentId, 'student', 3, "Poha was a bit dry, but tea was good.", "breakfast", today
    ]);

    // 4. Seed Events
    await db.query("INSERT IGNORE INTO events (title, description, start_date, end_date, type, location, is_important, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
        "Tech Fest 2026", "Annual technical festival with coding competitions and workshops.",
        "2026-05-10 09:00:00", "2026-05-12 18:00:00", "fest", "College Main Ground", true, adminId
    ]);
    await db.query("INSERT IGNORE INTO events (title, description, start_date, end_date, type, location, is_important, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
        "Google Recruitment Talk", "Pre-placement talk by Google engineers for final year students.",
        "2026-04-30 14:00:00", "2026-04-30 16:00:00", "placement", "Auditorium", true, placementCellId
    ]);
    await db.query("INSERT IGNORE INTO events (title, description, start_date, end_date, type, location, is_important, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
        "Internal Hackathon", "24-hour hackathon for second and third year students.",
        "2026-05-20 10:00:00", "2026-05-21 10:00:00", "academic", "CS Lab 1", false, adminId
    ]);

    // 5. Seed Placement Jobs
    const [jobRes] = await db.query("INSERT IGNORE INTO placement_jobs (company, role, package, deadline, min_cgpa, branches, description) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        "Microsoft", "Software Development Engineer", "45 LPA", "2026-05-15 23:59:59", 8.5, "CS, IT", "Join Microsoft's Cloud + AI team to build the next generation of global scale services."
    ]);
    const jobId1 = jobRes.insertId;

    const [jobRes2] = await db.query("INSERT IGNORE INTO placement_jobs (company, role, package, deadline, min_cgpa, branches, description) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        "Amazon", "Applied Scientist", "35 LPA", "2026-05-10 23:59:59", 8.0, "CS, IT, EC", "Work on cutting-edge machine learning models for Amazon Alexa and search ranking."
    ]);
    const jobId2 = jobRes2.insertId;

    // 6. Seed Placement Applications
    if (jobId1 > 0) {
        await db.query("INSERT IGNORE INTO placement_applications (student_id, job_id, status, resume_url) VALUES (?, ?, ?, ?)", [
            studentId, jobId1, "shortlisted", "https://docs.google.com/viewer?url=test_resume.pdf"
        ]);
    }
    if (jobId2 > 0) {
        await db.query("INSERT IGNORE INTO placement_applications (student_id, job_id, status, resume_url) VALUES (?, ?, ?, ?)", [
            studentId, jobId2, "applied", "https://docs.google.com/viewer?url=test_resume.pdf"
        ]);
    }

    console.log("✅ Sample data seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
