const db = require('../config/db');

class MessFeedback {
    static async create(data) {
        const { user_id, user_type, rating, comment, meal_type, date } = data;
        const [result] = await db.query(
            "INSERT INTO mess_feedback (user_id, user_type, rating, comment, meal_type, date) VALUES (?, ?, ?, ?, ?, ?)",
            [user_id, user_type, rating, comment, meal_type, date]
        );
        return result.insertId;
    }

    static async getSummary() {
        const [avgRating] = await db.query("SELECT AVG(rating) as avg_rating FROM mess_feedback");
        const [mealStats] = await db.query(`
            SELECT meal_type, AVG(rating) as avg_rating, COUNT(*) as count 
            FROM mess_feedback 
            GROUP BY meal_type
        `);
        const [recentFeedback] = await db.query(`
            SELECT f.*, 
            CASE WHEN user_type = 'student' THEN (SELECT name FROM students WHERE id = f.user_id)
                 WHEN user_type = 'teacher' THEN (SELECT name FROM teachers WHERE id = f.user_id)
            END as user_name
            FROM mess_feedback f
            ORDER BY created_at DESC LIMIT 10
        `);

        // --- Mock AI Insights ---
        const allComments = recentFeedback.map(f => f.comment.toLowerCase()).join(" ");
        let aiSuggestion = "Maintain current quality.";
        if (allComments.includes("paneer")) aiSuggestion = "Students love Paneer dishes. Consider adding them to the weekend menu! 🧀";
        if (allComments.includes("spicy")) aiSuggestion = "Multiple complaints about spice levels. Consider reducing chili in dinner. 🌶️";
        if (allComments.includes("dry")) aiSuggestion = "Breakfast items reported as dry. Ensure fresh serving. 🥣";

        let sentiment = "Neutral 😐";
        if (avgRating[0].avg_rating >= 4) sentiment = "Positive 😊";
        else if (avgRating[0].avg_rating < 3) sentiment = "Needs Improvement 😞";
        
        return {
            averageRating: avgRating[0].avg_rating || 0,
            mealStats,
            recentFeedback,
            aiInsights: {
                suggestion: aiSuggestion,
                sentiment: sentiment
            }
        };
    }

    static async findAll(filters = {}) {
        let q = "SELECT * FROM mess_feedback";
        const params = [];
        const conditions = [];

        if (filters.date) {
            conditions.push("date = ?");
            params.push(filters.date);
        }

        if (conditions.length > 0) {
            q += " WHERE " + conditions.join(" AND ");
        }

        q += " ORDER BY created_at DESC";

        const [rows] = await db.query(q, params);
        return rows;
    }
}

module.exports = MessFeedback;
