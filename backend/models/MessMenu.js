const db = require('../config/db');

class MessMenu {
    static async findByDate(date) {
        const [rows] = await db.query("SELECT * FROM mess_menu WHERE date = ?", [date]);
        return rows.length ? rows[0] : null;
    }

    static async getUpcoming(limit = 7) {
        const [rows] = await db.query(
            "SELECT * FROM mess_menu WHERE date >= CURDATE() ORDER BY date ASC LIMIT ?",
            [limit]
        );
        return rows;
    }

    static async createOrUpdate(data) {
        const { date, breakfast, lunch, dinner, added_by } = data;
        const [existing] = await db.query("SELECT id FROM mess_menu WHERE date = ?", [date]);

        if (existing.length > 0) {
            const [result] = await db.query(
                "UPDATE mess_menu SET breakfast = ?, lunch = ?, dinner = ?, added_by = ? WHERE date = ?",
                [breakfast, lunch, dinner, added_by, date]
            );
            return result.affectedRows > 0;
        } else {
            const [result] = await db.query(
                "INSERT INTO mess_menu (date, breakfast, lunch, dinner, added_by) VALUES (?, ?, ?, ?, ?)",
                [date, breakfast, lunch, dinner, added_by]
            );
            return result.insertId;
        }
    }

    static async delete(date) {
        const [result] = await db.query("DELETE FROM mess_menu WHERE date = ?", [date]);
        return result.affectedRows > 0;
    }
}

module.exports = MessMenu;
