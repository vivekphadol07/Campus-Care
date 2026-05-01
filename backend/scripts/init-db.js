require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");

(async () => {
  try {
    // 1. Classes Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        class_teacher_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Teachers / Staff Table (Extended Roles)
    // Adding mess_owner and placement_cell
    await db.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('admin','teacher','mess_owner','placement_cell') DEFAULT 'teacher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Students Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        roll_number VARCHAR(50) UNIQUE,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        class_id INT,
        branch VARCHAR(100),
        year VARCHAR(50),
        semester VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )
    `);

    // 4. Attendance Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        date DATE,
        subject VARCHAR(100),
        status ENUM('present','absent','leave'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // 5. Leaves Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        start_date DATE,
        end_date DATE,
        reason TEXT,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // 6. Teacher Subjects Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher_subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT,
        class_id INT,
        subject VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id),
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )
    `);

    // --- NEW TABLES ---

    // 7. Mess Menu Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS mess_menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE UNIQUE,
        breakfast TEXT,
        lunch TEXT,
        dinner TEXT,
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES teachers(id)
      )
    `);

    // 8. Mess Feedback Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS mess_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_type ENUM('student','teacher'),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        meal_type ENUM('breakfast','lunch','dinner'),
        date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Events Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        start_date DATETIME,
        end_date DATETIME,
        type ENUM('academic','placement','fest','personal'),
        location VARCHAR(255),
        is_important BOOLEAN DEFAULT FALSE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES teachers(id)
      )
    `);

    // 10. Placement Jobs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS placement_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company VARCHAR(100),
        role VARCHAR(100),
        package VARCHAR(50),
        deadline DATETIME,
        min_cgpa DECIMAL(4,2),
        branches TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 11. Placement Applications Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS placement_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        job_id INT,
        status ENUM('applied','shortlisted','interview','selected','rejected') DEFAULT 'applied',
        resume_url VARCHAR(255),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (job_id) REFERENCES placement_jobs(id)
      )
    `);

    // 12. Meal Requests (Room Delivery) Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS meal_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        room_number VARCHAR(20),
        reason TEXT,
        meal_type ENUM('breakfast','lunch','dinner'),
        status ENUM('pending','approved','delivered','rejected') DEFAULT 'pending',
        request_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    const [admin] = await db.query("SELECT * FROM teachers WHERE email=?", [
      "admin@school.com",
    ]);

    if (admin.length === 0) {
      const hashed = await bcrypt.hash("admin123", 10);
      await db.query(
        "INSERT INTO teachers (name,email,password,role) VALUES (?,?,?,?)",
        ["Institute Admin", "admin@school.com", hashed, "admin"],
      );
    }

    console.log("✅ Database initialized with new modules");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

