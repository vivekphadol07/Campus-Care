const db = require('../config/db');

const initPlacementDB = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS placement_jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                package VARCHAR(100),
                deadline DATE,
                min_cgpa DECIMAL(3,2),
                branches TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS placement_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                job_id INT NOT NULL,
                status ENUM('Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected') DEFAULT 'Applied',
                resume_url TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (job_id) REFERENCES placement_jobs(id)
            )
        `);

        console.log("Placement tables initialized");
    } catch (err) {
        console.error("Error initializing placement tables:", err.message);
    }
};

module.exports = initPlacementDB;
