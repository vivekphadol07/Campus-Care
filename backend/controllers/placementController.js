const Job = require('../models/Job');
const Application = require('../models/Application');
const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        const stats = {
            total: 0,
            shortlisted: 0,
            selected: 0,
            rejected: 0
        };

        if (req.user.role === 'student') {
            const apps = await Application.findByStudent(req.user.id);
            stats.total = apps.length;
            stats.shortlisted = apps.filter(a => a.status === 'Shortlisted').length;
            stats.selected = apps.filter(a => a.status === 'Selected').length;
            stats.rejected = apps.filter(a => a.status === 'Rejected').length;
        } else {
            const apps = await Application.findAll();
            stats.total = apps.length;
            stats.shortlisted = apps.filter(a => a.status === 'Shortlisted').length;
            stats.selected = apps.filter(a => a.status === 'Selected').length;
            stats.rejected = apps.filter(a => a.status === 'Rejected').length;
        }

        const recentJobs = await Job.findAll(); // Job.findAll returns sorted by deadline
        
        res.json({
            stats,
            recentJobs: recentJobs.slice(0, 5)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll(req.query);
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createJob = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'placement_cell') {
            return res.status(403).json({ message: "Access denied" });
        }
        const jobId = await Job.create(req.body);
        res.status(201).json({ message: "Job posted", id: jobId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        
        const resumeUrl = req.file.path;
        
        // Update student profile with resumeUrl
        const [exists] = await db.query("SELECT student_id FROM student_profiles WHERE student_id = ?", [req.user.id]);
        if (exists.length) {
            await db.query("UPDATE student_profiles SET resume_url = ? WHERE student_id = ?", [resumeUrl, req.user.id]);
        } else {
            await db.query("INSERT INTO student_profiles (student_id, resume_url) VALUES (?, ?)", [req.user.id, resumeUrl]);
        }

        res.json({ message: "Resume uploaded successfully", url: resumeUrl });
    } catch (err) {
        console.error("Upload Resume Error:", err);
        res.status(500).json({ message: "Server error during resume upload" });
    }
};

exports.applyForJob = async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ message: "Only students can apply" });
        
        const { jobId, resumeUrl } = req.body;
        
        // Check job existence
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Check if already applied
        const exists = await Application.checkDuplicate(req.user.id, jobId);
        if (exists) return res.status(400).json({ message: "You have already applied for this position" });

        // Fetch student profile for eligibility check
        const [profiles] = await db.query("SELECT * FROM student_profiles WHERE student_id = ?", [req.user.id]);
        const [students] = await db.query("SELECT branch FROM students WHERE id = ?", [req.user.id]);
        
        const profile = profiles.length ? profiles[0] : null;
        const student = students.length ? students[0] : null;

        // CGPA check
        if (job.min_cgpa && job.min_cgpa > 0) {
            if (!profile || !profile.cgpa) {
                return res.status(400).json({ message: "Please update your CGPA in your profile before applying" });
            }
            if (parseFloat(profile.cgpa) < parseFloat(job.min_cgpa)) {
                return res.status(400).json({ message: `Ineligible: Minimum CGPA required is ${job.min_cgpa}. Your CGPA is ${profile.cgpa}` });
            }
        }

        // Branch check (if job has specific branches)
        if (job.branches && job.branches !== 'All' && job.branches.trim() !== '') {
            const allowedBranches = job.branches.split(',').map(b => b.trim().toLowerCase());
            if (student && student.branch && !allowedBranches.includes(student.branch.toLowerCase())) {
                return res.status(400).json({ message: `Ineligible: This position is only for ${job.branches} branches.` });
            }
        }

        const appId = await Application.create({
            student_id: req.user.id,
            job_id: jobId,
            resume_url: resumeUrl
        });

        res.status(201).json({ message: "Application submitted successfully", id: appId });
    } catch (err) {
        console.error("Apply For Job Error:", err);
        res.status(500).json({ message: "Server error during application" });
    }
};

exports.getApplications = async (req, res) => {
    try {
        let applications;
        if (req.user.role === 'student') {
            applications = await Application.findByStudent(req.user.id);
        } else if (req.user.role === 'admin' || req.user.role === 'placement_cell') {
            if (req.query.jobId) {
                applications = await Application.findByJob(req.query.jobId);
            } else {
                // Return all applications for analytics if no jobId
                applications = await Application.findAll();
            }
        }
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'placement_cell') {
            return res.status(403).json({ message: "Access denied" });
        }
        const { status } = req.body;
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ message: "Application not found" });

        await Application.updateStatus(req.params.id, status);

        // Emit socket notification
        const io = req.app.get("socketio");
        io.to(`user_${application.student_id}`).emit("status_update", {
            applicationId: req.params.id,
            status: status,
            message: `Your application for ${application.company} has been updated to ${status}`
        });

        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

