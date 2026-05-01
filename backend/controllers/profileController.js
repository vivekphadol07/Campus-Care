const db = require('../config/db');

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
};

exports.getProfile = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch core data with explicit column selection to avoid collisions
        const [student] = await db.query(`
            SELECT 
                s.id, s.name, s.roll_number, s.email, s.profile_pic,
                s.branch, s.year, s.semester, s.class_id,
                c.name as class_name, c.class_teacher_id,
                p.*
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN student_profiles p ON s.id = p.student_id
            WHERE s.id = ?
        `, [id]);

        if (!student.length) return res.status(404).json({ error: "Student not found" });

        const profileData = student[0];

        // Permission Check: Owner, Admin, or Class Teacher
        const isOwner = String(id) === String(req.user.id) && req.user.role === 'student';
        const isAdmin = req.user.role === 'admin';
        const isClassTeacher = req.user.role === 'teacher' && String(req.user.id) === String(profileData.class_teacher_id);

        if (!isOwner && !isAdmin && !isClassTeacher) {
            return res.status(403).json({ error: "Unauthorized access to profile" });
        }

        // Fetch related collections
        const [skills] = await db.query("SELECT * FROM student_skills WHERE student_id = ?", [id]);
        const [projects] = await db.query("SELECT * FROM student_projects WHERE student_id = ?", [id]);
        const [experience] = await db.query("SELECT * FROM student_experience WHERE student_id = ?", [id]);
        const [certifications] = await db.query("SELECT * FROM student_certifications WHERE student_id = ?", [id]);
        const [achievements] = await db.query("SELECT * FROM student_achievements WHERE student_id = ?", [id]);
        const [engagement] = await db.query("SELECT * FROM student_engagement WHERE student_id = ?", [id]);
        const [education] = await db.query("SELECT * FROM student_education WHERE student_id = ? ORDER BY year_of_passing DESC", [id]);

        res.json({
            ...profileData,
            skills,
            projects,
            experience,
            certifications,
            achievements,
            engagement,
            education
        });
    } catch (err) {
        console.error("Get Profile Error Details:", {
            message: err.message,
            stack: err.stack,
            id: id
        });
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    if (String(id) !== String(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const sensitiveFields = [];
        // Filter out fields that don't belong to student_profiles table
        const allowedColumns = [
            'phone', 'personal_email', 'college_name', 'bio', 'cgpa', 
            'marks_10th', 'marks_12th', 'backlogs', 'interests', 'soft_skills', 
            'branch', 'semester', 'year', 'admission_year', 'first_name', 'middle_name', 'last_name', 
            'mother_name', 'dob', 'gender', 'blood_group', 'mother_tongue', 
            'alternate_phone', 'nationality', 'domicile', 'religion', 'caste', 
            'category', 'hostelite', 'marital_status', 'prn_no', 'adhar_no', 
            'abc_id', 'admission_date', 'father_name', 'parent_phone', 
            'parent_occupation', 'address', 'privacy_settings',
            'current_address_line1', 'current_address_line2', 'current_country', 
            'current_state', 'current_city', 'current_pincode',
            'permanent_address_line1', 'permanent_address_line2', 'permanent_country', 
            'permanent_state', 'permanent_city', 'permanent_pincode', 'same_as_current',
            'father_organisation', 'father_designation', 'father_email',
            'mother_organisation', 'mother_designation', 'mother_email', 'mother_phone'
        ];

        const updates = {};
        Object.keys(updateData).forEach(key => {
            if (allowedColumns.includes(key)) {
                let value = updateData[key];
                // Sanitize date fields for MySQL
                if (['dob', 'admission_date'].includes(key) && value) {
                    value = formatDate(value);
                }
                updates[key] = value;
            }
        });

        const requests = [];

        if (req.user.role !== 'admin') {
            sensitiveFields.forEach(field => {
                // Only create a request if the value is being changed and is not null/empty
                if (updates[field] !== undefined && updates[field] !== null && updates[field] !== '') {
                    requests.push({
                        student_id: id,
                        field_name: field,
                        new_value: String(updates[field])
                    });
                }
                // Always delete from direct updates to prevent DB errors
                delete updates[field];
            });
        }

        // Direct updates for non-sensitive fields
        if (Object.keys(updates).length > 0) {
            const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
            const values = Object.values(updates);
            
            // Check if profile exists first
            const [exists] = await db.query("SELECT student_id FROM student_profiles WHERE student_id = ?", [id]);
            if (exists.length) {
                await db.query(`UPDATE student_profiles SET ${fields} WHERE student_id = ?`, [...values, id]);
            } else {
                const keys = ['student_id', ...Object.keys(updates)].join(', ');
                const placeholders = ['?', ...Object.keys(updates).map(() => '?')].join(', ');
                await db.query(`INSERT INTO student_profiles (${keys}) VALUES (${placeholders})`, [id, ...values]);
            }
        }

        // Handle core student table updates (branch, year, semester)
        const coreFields = ['branch', 'year', 'semester'];
        const coreUpdates = {};
        coreFields.forEach(f => {
            if (updateData[f] !== undefined) coreUpdates[f] = updateData[f];
        });

        if (Object.keys(coreUpdates).length > 0) {
            const fields = Object.keys(coreUpdates).map(k => `${k} = ?`).join(', ');
            const values = Object.values(coreUpdates);
            await db.query(`UPDATE students SET ${fields} WHERE id = ?`, [...values, id]);
        }

        // Handle update requests for sensitive fields
        for (const reqObj of requests) {
            await db.query(
                "INSERT INTO profile_update_requests (student_id, field_name, new_value) VALUES (?, ?, ?)",
                [reqObj.student_id, reqObj.field_name, reqObj.new_value]
            );
        }

        res.json({ message: "Profile updated successfully", requestsCreated: requests.length });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.addCollectionItem = async (req, res) => {
    const { type } = req.params;
    const { student_id, ...data } = req.body;

    const tableMap = {
        skills: 'student_skills',
        projects: 'student_projects',
        experience: 'student_experience',
        certifications: 'student_certifications',
        achievements: 'student_achievements',
        engagement: 'student_engagement',
        education: 'student_education'
    };

    const tableName = tableMap[type];
    if (!tableName) return res.status(400).json({ error: "Invalid collection type" });

    try {
        const processedData = { ...data };
        const dateFields = ['date', 'from_date', 'to_date', 'start_date', 'end_date'];
        
        Object.keys(processedData).forEach(key => {
            if (dateFields.includes(key) && processedData[key]) {
                processedData[key] = formatDate(processedData[key]);
            }
        });

        const keys = ['student_id', ...Object.keys(processedData)].join(', ');
        const placeholders = ['?', ...Object.keys(processedData).map(() => '?')].join(', ');
        const [result] = await db.query(`INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`, [student_id, ...Object.values(processedData)]);
        res.json({ id: result.insertId, message: "Item added successfully" });
    } catch (err) {
        console.error(`Add ${type} Error:`, err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteCollectionItem = async (req, res) => {
    const { type, id } = req.params;
    const tableMap = {
        skills: 'student_skills',
        projects: 'student_projects',
        experience: 'student_experience',
        certifications: 'student_certifications',
        achievements: 'student_achievements',
        engagement: 'student_engagement',
        education: 'student_education'
    };

    const tableName = tableMap[type];
    if (!tableName) return res.status(400).json({ error: "Invalid collection type" });

    try {
        await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error(`Delete ${type} Error:`, err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getUpdateRequests = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, s.name, s.roll_number 
            FROM profile_update_requests r
            JOIN students s ON r.student_id = s.id
            WHERE r.status = 'Pending'
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.handleUpdateRequest = async (req, res) => {
    const { requestId, action } = req.body; // action: 'approve' or 'reject'
    try {
        const [request] = await db.query("SELECT * FROM profile_update_requests WHERE id = ?", [requestId]);
        if (!request.length) return res.status(404).json({ error: "Request not found" });

        const reqData = request[0];

        if (action === 'approve') {
            await db.query(
                `UPDATE student_profiles SET ${reqData.field_name} = ? WHERE student_id = ?`,
                [reqData.new_value, reqData.student_id]
            );
            await db.query("UPDATE profile_update_requests SET status = 'Approved' WHERE id = ?", [requestId]);
        } else {
            await db.query("UPDATE profile_update_requests SET status = 'Rejected' WHERE id = ?", [requestId]);
        }

        res.json({ message: `Request ${action}d successfully` });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
