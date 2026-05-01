const db = require('../config/db');

const initProfileDB = async () => {
    try {
        // 1. Core Profile Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_profiles (
                student_id INT PRIMARY KEY,
                phone VARCHAR(20),
                personal_email VARCHAR(255),
                college_name VARCHAR(255),
                bio TEXT,
                cgpa DECIMAL(3,2),
                marks_10th DECIMAL(5,2),
                marks_12th DECIMAL(5,2),
                backlogs INT DEFAULT 0,
                interests TEXT,
                soft_skills TEXT,
                branch VARCHAR(255),
                semester VARCHAR(20),
                
                -- Extended Details from User Request
                first_name VARCHAR(100),
                middle_name VARCHAR(100),
                last_name VARCHAR(100),
                mother_name VARCHAR(100),
                dob DATE,
                gender ENUM('Male', 'Female', 'Other'),
                blood_group VARCHAR(10),
                mother_tongue VARCHAR(50),
                alternate_phone VARCHAR(20),
                nationality VARCHAR(100),
                domicile VARCHAR(100),
                religion VARCHAR(100),
                caste VARCHAR(100),
                category VARCHAR(100),
                hostelite ENUM('Yes', 'No'),
                marital_status ENUM('Single', 'Married'),
                prn_no VARCHAR(50),
                adhar_no VARCHAR(20),
                abc_id VARCHAR(50),
                admission_date DATE,
                
                -- Parent & Guardian Info
                father_name VARCHAR(100),
                parent_phone VARCHAR(20),
                parent_occupation VARCHAR(100),
                address TEXT,
                
                privacy_settings TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        // 2. Technical Skills
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                skill_name VARCHAR(100) NOT NULL,
                proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        // 3. Projects
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                link VARCHAR(255),
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        // 4. Experience (Internships/Work)
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_experience (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                company VARCHAR(255) NOT NULL,
                role VARCHAR(255),
                duration VARCHAR(100),
                description TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        // 5. Certifications
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_certifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                issuer VARCHAR(255),
                date DATE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        // 6. Achievements
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_achievements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                category ENUM('Award', 'Hackathon', 'Scholarship', 'Competition'),
                description TEXT,
                date DATE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        // 7. Engagement (Clubs/Events)
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_engagement (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                organization VARCHAR(255) NOT NULL,
                role VARCHAR(255),
                description TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        // 8. Update Requests (For sensitive data like CGPA)
        await db.query(`
            CREATE TABLE IF NOT EXISTS profile_update_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                field_name VARCHAR(100) NOT NULL,
                old_value TEXT,
                new_value TEXT NOT NULL,
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);

        console.log("Student Profile tables initialized");
    } catch (err) {
        console.error("Error initializing student profile tables:", err.message);
    }
};

module.exports = initProfileDB;
