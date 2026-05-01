const db = require('../config/db');

class Student {
    static async findAll(filters = {}) {
        let q = `
      SELECT s.*, c.name as class_name, c.class_teacher_id 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
    `;
        const params = [];
        const conditions = [];

        if (filters.class_id) {
            conditions.push("s.class_id = ?");
            params.push(filters.class_id);
        }

        if (filters.teacher_id) {
            // Students linked via Class Teacher role or Subject Teacher role
            conditions.push(`(
        c.class_teacher_id = ? OR 
        s.class_id IN (SELECT class_id FROM teacher_subjects WHERE teacher_id = ?)
      )`);
            params.push(filters.teacher_id, filters.teacher_id);
        }

        if (filters.class_teacher_id) {
            // Specifically for internal use if needed
            conditions.push(`s.class_id IN (SELECT id FROM classes WHERE class_teacher_id = ?)`);
            params.push(filters.class_teacher_id);
        }

        if (conditions.length > 0) {
            q += " WHERE " + conditions.join(" AND ");
        }

        const [rows] = await db.query(q, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM students WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(data) {
        const { name, roll_number, email, password, class_id, branch, year, semester } = data;
        const [result] = await db.query(
            "INSERT INTO students (name, roll_number, email, password, class_id, branch, year, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [name, roll_number, email, password, class_id || null, branch || null, year || null, semester || null]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const fields = [];
        const params = [];

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(data[key]);
            }
        });

        if (fields.length === 0) return false;

        params.push(id);
        const [result] = await db.query(
            `UPDATE students SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        // Note: Caller should handle related records if cascade is not set in DB
        const [result] = await db.query("DELETE FROM students WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    static async findByEmailOrRoll(identifier) {
        const [rows] = await db.query(
            "SELECT * FROM students WHERE email = ? OR roll_number = ?",
            [identifier, identifier]
        );
        return rows.length ? rows[0] : null;
    }

    static async count() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM students");
        return rows[0].count;
    }
}

module.exports = Student;
