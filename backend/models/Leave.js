const db = require('../config/db');

class Leave {
    static async findAll(filters = {}) {
        let q = "SELECT l.*, s.name as student_name, s.roll_number, c.name as class_name FROM leaves l JOIN students s ON l.student_id = s.id JOIN classes c ON s.class_id = c.id WHERE 1=1";
        const params = [];

        if (filters.student_id) {
            q += " AND l.student_id = ?";
            params.push(filters.student_id);
        }
        if (filters.status) {
            q += " AND l.status = ?";
            params.push(filters.status);
        }
        if (filters.class_id) {
            q += " AND s.class_id = ?";
            params.push(filters.class_id);
        }
        if (filters.class_teacher_id) {
            q += " AND c.class_teacher_id = ?";
            params.push(filters.class_teacher_id);
        }

        q += " ORDER BY l.created_at DESC";
        const [rows] = await db.query(q, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM leaves WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(data) {
        const { student_id, reason, start_date, end_date } = data;
        const [result] = await db.query(
            "INSERT INTO leaves (student_id, reason, start_date, end_date) VALUES (?, ?, ?, ?)",
            [student_id, reason, start_date, end_date]
        );
        return result.insertId;
    }

    static async updateStatus(id, status) {
        const [result] = await db.query("UPDATE leaves SET status = ? WHERE id = ?", [status, id]);
        return result.affectedRows > 0;
    }

    static async deleteByStudent(studentId) {
        await db.query("DELETE FROM leaves WHERE student_id = ?", [studentId]);
    }

    static async findApprovedByStudent(studentId) {
        const [rows] = await db.query(
            "SELECT start_date, end_date FROM leaves WHERE student_id = ? AND status = 'approved'",
            [studentId]
        );
        return rows;
    }

    static async countPending() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM leaves WHERE status = 'pending'");
        return rows[0].count;
    }

    static async countPendingByTeacher(teacherId) {
        const [rows] = await db.query(
            `SELECT COUNT(*) as count FROM leaves l 
       JOIN students s ON l.student_id = s.id 
       JOIN classes c ON s.class_id = c.id 
       WHERE c.class_teacher_id = ? AND l.status = 'pending'`,
            [teacherId]
        );
        return rows[0].count;
    }
}

module.exports = Leave;
