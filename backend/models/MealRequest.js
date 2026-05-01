const db = require('../config/db');

class MealRequest {
    static async create(data) {
        const { student_id, room_number, reason, meal_type, request_date } = data;
        const [result] = await db.query(
            "INSERT INTO meal_requests (student_id, room_number, reason, meal_type, request_date) VALUES (?, ?, ?, ?, ?)",
            [student_id, room_number, reason, meal_type, request_date]
        );
        return result.insertId;
    }

    static async findAll(filters = {}) {
        let q = `
            SELECT r.*, s.name as student_name, s.roll_number 
            FROM meal_requests r
            JOIN students s ON r.student_id = s.id
        `;
        const params = [];
        const conditions = [];

        if (filters.status) {
            conditions.push("r.status = ?");
            params.push(filters.status);
        }

        if (filters.date) {
            conditions.push("r.request_date = ?");
            params.push(filters.date);
        }

        if (filters.student_id) {
            conditions.push("r.student_id = ?");
            params.push(filters.student_id);
        }

        if (conditions.length > 0) {
            q += " WHERE " + conditions.join(" AND ");
        }

        q += " ORDER BY r.created_at DESC";

        const [rows] = await db.query(q, params);
        return rows;
    }

    static async updateStatus(id, status) {
        const [result] = await db.query(
            "UPDATE meal_requests SET status = ? WHERE id = ?",
            [status, id]
        );
        return result.affectedRows > 0;
    }

    static async findByStudent(studentId) {
        const [rows] = await db.query(
            "SELECT * FROM meal_requests WHERE student_id = ? ORDER BY created_at DESC",
            [studentId]
        );
        return rows;
    }
}

module.exports = MealRequest;
