const db = require('../config/db');

class Application {
    static async create(data) {
        const { student_id, job_id, resume_url } = data;
        const [result] = await db.query(
            "INSERT INTO placement_applications (student_id, job_id, resume_url) VALUES (?, ?, ?)",
            [student_id, job_id, resume_url]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT a.*, j.company 
            FROM placement_applications a
            JOIN placement_jobs j ON a.job_id = j.id
            WHERE a.id = ?
        `, [id]);
        return rows.length ? rows[0] : null;
    }

    static async findAll() {
        const [rows] = await db.query(`
            SELECT a.*, j.company, j.role, s.name as student_name
            FROM placement_applications a
            JOIN placement_jobs j ON a.job_id = j.id
            JOIN students s ON a.student_id = s.id
            ORDER BY a.applied_at DESC
        `);
        return rows;
    }

    static async findByStudent(studentId) {
        const [rows] = await db.query(`
            SELECT a.*, j.company, j.role, j.package 
            FROM placement_applications a
            JOIN placement_jobs j ON a.job_id = j.id
            WHERE a.student_id = ?
            ORDER BY a.applied_at DESC
        `, [studentId]);
        return rows;
    }

    static async findByJob(jobId) {
        const [rows] = await db.query(`
            SELECT a.*, s.name as student_name, s.email, s.roll_number 
            FROM placement_applications a
            JOIN students s ON a.student_id = s.id
            WHERE a.job_id = ?
            ORDER BY a.applied_at DESC
        `, [jobId]);
        return rows;
    }

    static async updateStatus(id, status) {
        const [result] = await db.query(
            "UPDATE placement_applications SET status = ? WHERE id = ?",
            [status, id]
        );
        return result.affectedRows > 0;
    }

    static async checkDuplicate(studentId, jobId) {
        const [rows] = await db.query(
            "SELECT id FROM placement_applications WHERE student_id = ? AND job_id = ?",
            [studentId, jobId]
        );
        return rows.length > 0;
    }
}

module.exports = Application;
