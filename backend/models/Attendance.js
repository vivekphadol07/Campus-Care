const db = require('../config/db');

class Attendance {
    static async findAll(filters = {}) {
        let q = "SELECT * FROM attendance WHERE 1=1";
        const params = [];

        if (filters.student_id) {
            q += " AND student_id = ?";
            params.push(filters.student_id);
        }
        if (filters.date) {
            q += " AND date = ?";
            params.push(filters.date);
        }
        if (filters.subject) {
            q += " AND subject = ?";
            params.push(filters.subject);
        }
        if (filters.start_time) {
            q += " AND start_time = ?";
            params.push(filters.start_time);
        }

        q += " ORDER BY date DESC, start_time ASC";
        const [rows] = await db.query(q, params);
        return rows;
    }

    static async upsert(data) {
        const { student_id, status, date, subject, start_time, end_time } = data;

        // Check if record exists
        const [existing] = await db.query(
            "SELECT id FROM attendance WHERE student_id = ? AND date = ? AND subject = ? AND start_time = ?",
            [student_id, date, subject, start_time]
        );

        if (existing.length > 0) {
            await db.query(
                "UPDATE attendance SET status = ?, end_time = ? WHERE id = ?",
                [status, end_time, existing[0].id]
            );
            return existing[0].id;
        } else {
            const [result] = await db.query(
                "INSERT INTO attendance (student_id, status, date, subject, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)",
                [student_id, status, date, subject, start_time, end_time]
            );
            return result.insertId;
        }
    }

    static async deleteByStudent(studentId) {
        await db.query("DELETE FROM attendance WHERE student_id = ?", [studentId]);
    }

    static async countPresentToday() {
        const [rows] = await db.query(
            "SELECT COUNT(DISTINCT student_id) as count FROM attendance WHERE date = CURDATE() AND status='present'"
        );
        return rows[0].count;
    }

    static async getStudentDetailedRecords(studentId) {
        const [rows] = await db.query(
            `SELECT a.*, MAX(tr.name) as teacher_name 
       FROM attendance a 
       JOIN students s ON a.student_id = s.id
       LEFT JOIN timetable t ON (
         t.class_id = s.class_id AND 
         t.subject = a.subject AND 
         TIME_FORMAT(t.start_time, '%H:%i') = TIME_FORMAT(a.start_time, '%H:%i')
       )
       LEFT JOIN teachers tr ON t.teacher_id = tr.id
       WHERE a.student_id = ? AND a.status != 'leave'
       GROUP BY a.id`,
            [studentId]
        );
        return rows;
    }
}

module.exports = Attendance;
