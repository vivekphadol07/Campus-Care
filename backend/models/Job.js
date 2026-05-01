const db = require('../config/db');

class Job {
    static async findAll(filters = {}) {
        let q = "SELECT * FROM placement_jobs";
        const params = [];
        const conditions = [];

        if (filters.company) {
            conditions.push("company LIKE ?");
            params.push(`%${filters.company}%`);
        }

        if (filters.min_cgpa) {
            conditions.push("min_cgpa <= ?");
            params.push(filters.min_cgpa);
        }

        if (conditions.length > 0) {
            q += " WHERE " + conditions.join(" AND ");
        }

        q += " ORDER BY deadline ASC";

        const [rows] = await db.query(q, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM placement_jobs WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }

    static async create(data) {
        const { company, role, package: pkg, deadline, min_cgpa, branches, description } = data;
        const [result] = await db.query(
            "INSERT INTO placement_jobs (company, role, package, deadline, min_cgpa, branches, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [company, role, pkg, deadline, min_cgpa, branches, description]
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
        const [result] = await db.query(`UPDATE placement_jobs SET ${fields.join(', ')} WHERE id = ?`, params);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query("DELETE FROM placement_jobs WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Job;
