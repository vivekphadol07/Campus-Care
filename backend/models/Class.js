const db = require('../config/db');

class Class {
    static async findAll() {
        const [rows] = await db.query("SELECT c.*, t.name as teacher_name FROM classes c LEFT JOIN teachers t ON c.class_teacher_id = t.id");
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM classes WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(data) {
        const { name, semester, class_teacher_id } = data;
        const [result] = await db.query(
            "INSERT INTO classes (name, semester, class_teacher_id) VALUES (?, ?, ?)",
            [name, semester, class_teacher_id || null]
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
            `UPDATE classes SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query("DELETE FROM classes WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    static async deleteTeacherAssignments(id) {
        await db.query("DELETE FROM teacher_subjects WHERE class_id = ?", [id]);
    }

    static async unlinkStudents(id) {
        await db.query("UPDATE students SET class_id = NULL WHERE class_id = ?", [id]);
    }

    static async listWithTeacher() {
        const [rows] = await db.query(`
      SELECT c.*, t.name AS class_teacher_name
      FROM classes c LEFT JOIN teachers t ON c.class_teacher_id = t.id
    `);
        return rows;
    }
}

module.exports = Class;
