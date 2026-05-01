const db = require('../config/db');

class Timetable {
    static async findAll(filters = {}) {
        let q = `
      SELECT t.*, c.name as class_name, tr.name as teacher_name 
      FROM timetable t 
      JOIN classes c ON t.class_id = c.id 
      JOIN teachers tr ON t.teacher_id = tr.id 
      WHERE 1=1
    `;
        const params = [];

        if (filters.class_id) {
            q += " AND t.class_id = ?";
            params.push(filters.class_id);
        }
        if (filters.teacher_id) {
            q += " AND t.teacher_id = ?";
            params.push(filters.teacher_id);
        }

        q += " ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time ASC";

        const [rows] = await db.query(q, params);
        return rows;
    }

    static async findSubjectsByClass(classId) {
        const [rows] = await db.query(
            "SELECT DISTINCT subject, teacher_id FROM timetable WHERE class_id = ?",
            [classId]
        );
        return rows;
    }

    static async create(data) {
        const { class_id, teacher_id, subject, day_of_week, start_time, end_time } = data;
        const [result] = await db.query(
            "INSERT INTO timetable (class_id, teacher_id, subject, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)",
            [class_id, teacher_id, subject, day_of_week, start_time, end_time]
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
            `UPDATE timetable SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query("DELETE FROM timetable WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    static async checkOverlap(class_id, day_of_week, start_time, end_time, excludeId = null) {
        let q = `
      SELECT id FROM timetable 
      WHERE class_id = ? AND day_of_week = ? 
      AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
    `;
        const params = [class_id, day_of_week, start_time, start_time, end_time, end_time];

        if (excludeId) {
            q += " AND id != ?";
            params.push(excludeId);
        }

        const [rows] = await db.query(q, params);
        return rows.length > 0;
    }
}

module.exports = Timetable;
