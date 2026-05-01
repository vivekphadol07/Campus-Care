const db = require('../config/db');

class Event {
    static async findAll(filters = {}) {
        let q = "SELECT e.*, t.name as creator_name FROM events e LEFT JOIN teachers t ON e.created_by = t.id";
        const params = [];
        const conditions = [];

        if (filters.type) {
            conditions.push("e.type = ?");
            params.push(filters.type);
        }

        if (filters.upcoming) {
            conditions.push("e.start_date >= CURDATE()");
        }

        if (conditions.length > 0) {
            q += " WHERE " + conditions.join(" AND ");
        }

        q += " ORDER BY e.start_date ASC";

        const [rows] = await db.query(q, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(data) {
        const { title, description, start_date, end_date, type, location, is_important, created_by } = data;
        const [result] = await db.query(
            "INSERT INTO events (title, description, start_date, end_date, type, location, is_important, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [title, description, start_date, end_date, type, location, is_important || false, created_by]
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
        const [result] = await db.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query("DELETE FROM events WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Event;
