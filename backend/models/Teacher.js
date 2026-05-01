const db = require('../config/db');

class Teacher {
    static async findAll() {
        const [rows] = await db.query("SELECT id, name, email, role FROM teachers");
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT id, name, email, role FROM teachers WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM teachers WHERE email = ?", [email]);
        return rows.length ? rows[0] : null;
    }

    static async create(data) {
        const { name, email, password, role } = data;
        const [result] = await db.query(
            "INSERT INTO teachers (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, password, role || 'teacher']
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
            `UPDATE teachers SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query("DELETE FROM teachers WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }

    static async getAssignments(teacherId) {
        const [rows] = await db.query(
            `SELECT ts.*, c.name as class_name 
       FROM teacher_subjects ts 
       JOIN classes c ON ts.class_id = c.id 
       WHERE ts.teacher_id = ?`,
            [teacherId]
        );
        return rows;
    }

    static async hasAssignment(teacherId, classId, subject) {
        const [rows] = await db.query(
            `SELECT id FROM teacher_subjects WHERE teacher_id = ? AND class_id = ? AND subject = ?
       UNION
       SELECT id FROM timetable WHERE teacher_id = ? AND class_id = ? AND subject = ?`,
            [teacherId, classId, subject, teacherId, classId, subject]
        );
        return rows.length > 0;
    }

    static async isClassTeacher(teacherId, classId) {
        const [rows] = await db.query(
            "SELECT id FROM classes WHERE id = ? AND class_teacher_id = ?",
            [classId, teacherId]
        );
        return rows.length > 0;
    }

    static async findAssignmentsByClass(classId) {
        const [rows] = await db.query(
            "SELECT subject, start_time, end_time FROM teacher_subjects WHERE class_id = ?",
            [classId]
        );
        return rows;
    }

    static async deleteAssignments(teacherId) {
        await db.query("DELETE FROM teacher_subjects WHERE teacher_id = ?", [teacherId]);
    }

    static async unlinkClasses(teacherId) {
        await db.query("UPDATE classes SET class_teacher_id = NULL WHERE class_teacher_id = ?", [teacherId]);
    }

    static async assignSubject(data) {
        const { teacher_id, class_id, subject, start_time, end_time } = data;
        const [result] = await db.query(
            "INSERT INTO teacher_subjects (teacher_id, class_id, subject, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
            [teacher_id, class_id, subject, start_time || null, end_time || null]
        );
        return result.insertId;
    }

    static async listAssignments() {
        const [rows] = await db.query(`
      SELECT ts.*, t.name as teacher_name, c.name as class_name
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN classes c ON ts.class_id = c.id
      ORDER BY ts.start_time ASC
    `);
        return rows;
    }

    static async deleteAssignmentById(id) {
        await db.query("DELETE FROM teacher_subjects WHERE id = ?", [id]);
    }

    static async count(role = 'teacher') {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM teachers WHERE role = ?", [role]);
        return rows[0].count;
    }

    static async getLeavesByTeacher(teacherId) {
        const [rows] = await db.query(
            "SELECT l.* FROM leaves l WHERE l.student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM teacher_subjects WHERE teacher_id=?))",
            [teacherId]
        );
        return rows;
    }

    static async getAttendanceByTeacher(teacherId) {
        const [rows] = await db.query(
            "SELECT a.* FROM attendance a WHERE a.subject IN (SELECT subject FROM teacher_subjects WHERE teacher_id=?)",
            [teacherId]
        );
        return rows;
    }

    static async getStudentsByTeacher(teacherId) {
        const [rows] = await db.query(
            "SELECT s.* FROM students s WHERE s.class_id IN (SELECT class_id FROM teacher_subjects WHERE teacher_id=?)",
            [teacherId]
        );
        return rows;
    }

    static async getPeerTeachers(teacherId) {
        const [rows] = await db.query(
            "SELECT id, name FROM teachers WHERE id IN (SELECT DISTINCT teacher_id FROM teacher_subjects WHERE class_id IN (SELECT class_id FROM teacher_subjects WHERE teacher_id=?))",
            [teacherId]
        );
        return rows;
    }

    static async getClassesByTeacher(teacherId) {
        const [rows] = await db.query(
            "SELECT * FROM classes WHERE id IN (SELECT class_id FROM teacher_subjects WHERE teacher_id=?)",
            [teacherId]
        );
        return rows;
    }

    static async getSubjectsByTeacher(teacherId) {
        const [rows] = await db.query(
            "SELECT DISTINCT subject FROM teacher_subjects WHERE teacher_id=?",
            [teacherId]
        );
        return rows.map(r => r.subject);
    }
}

module.exports = Teacher;
