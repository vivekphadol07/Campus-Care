const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Timetable = require("../models/Timetable");
const { calculateLeaveDays, getDayName } = require("../utils/dateUtils");
const db = require("../config/db"); // Keep for some complex parts if needed

exports.overallStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, presentToday, pendingLeaves] = await Promise.all([
      Student.count(),
      Teacher.count('teacher'),
      Attendance.countPresentToday(),
      Leave.countPending()
    ]);

    // Fetch attendance trend for the last 7 days
    const [trendRows] = await db.query(
      `SELECT date, COUNT(DISTINCT student_id) as present 
       FROM attendance 
       WHERE status = 'present' AND date >= CURDATE() - INTERVAL 6 DAY 
       GROUP BY date 
       ORDER BY date ASC`
    );

    // Format trend data (filling in missing days with 0)
    const activityTrend = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = trendRows.find(r => {
         // handle timezone offset from mysql if necessary, 
         // but simplest is to just check the string prefix or convert to local
         const rowDateStr = new Date(r.date).toISOString().split('T')[0];
         return rowDateStr === dateStr;
      });
      
      const presentCount = found ? found.present : 0;
      // Calculate a rough percentage assuming totalStudents is the base
      // If no students, default to 0
      const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
      
      activityTrend.push({
        name: days[d.getDay()],
        attendance: percentage,
        presentCount
      });
    }

    res.json({ totalStudents, totalTeachers, presentToday, pendingLeaves, activityTrend });
  } catch (err) {
    console.error("Overall Stats Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.studentStats = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    if (user.role === 'student' && String(user.id) !== String(id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // 1. Get detailed attendance records
    const records = await Attendance.getStudentDetailedRecords(id);

    // 2. Get approved leaves for bonus
    const approvedLeaves = await Leave.findApprovedByStudent(id);
    let totalLeaveDays = 0;
    approvedLeaves.forEach(l => {
      totalLeaveDays += calculateLeaveDays(l.start_date, l.end_date);
    });
    const leaveBonus = (totalLeaveDays / 2) * 0.25;

    // 3. Fallback for teacher names
    for (let r of records) {
      if (!r.teacher_name) {
        const [fallback] = await db.query(
          `SELECT tr.name FROM teacher_subjects ts 
           JOIN teachers tr ON ts.teacher_id = tr.id 
           WHERE ts.class_id = ? AND ts.subject = ? LIMIT 1`,
          [student.class_id || 0, r.subject]
        );
        if (fallback.length > 0) r.teacher_name = fallback[0].name;
      }
    }

    // 4. Get all subjects from timetable
    const timetableSubjects = await Timetable.findSubjectsByClass(student.class_id);
    const subjects = {};

    for (const ts of timetableSubjects) {
      if (!subjects[ts.subject]) {
        const teacherInfo = await Teacher.findById(ts.teacher_id);
        subjects[ts.subject] = {
          name: ts.subject,
          teacher: teacherInfo ? teacherInfo.name : "Unknown",
          total: 0,
          attended: 0,
          points: 0
        };
      }
    }

    let totalPoints = 0;
    records.forEach((r) => {
      let weight = (r.status === "present") ? 1 : 0;
      totalPoints += weight;

      if (r.subject) {
        if (!subjects[r.subject]) {
          subjects[r.subject] = {
            name: r.subject,
            teacher: r.teacher_name || "Unknown",
            total: 0,
            attended: 0,
            points: 0
          };
        }
        subjects[r.subject].total += 1;
        if (r.status === "present") {
          subjects[r.subject].attended += 1;
          subjects[r.subject].points += 1;
        }
      }
    });

    const subjectWise = Object.values(subjects).map(s => ({
      ...s,
      percentage: s.total ? ((s.points / s.total) * 100).toFixed(2) : "0.00"
    }));

    const basePercentage = records.length ? (totalPoints / records.length) * 100 : 0;
    const overallPercentage = (basePercentage + leaveBonus).toFixed(2);

    // 5. Get placement stats
    const [placementApps] = await db.query('SELECT status FROM placement_applications WHERE student_id = ?', [id]);
    const placementStats = {
      total: placementApps.length,
      shortlisted: placementApps.filter(a => a.status === 'Shortlisted').length,
      selected: placementApps.filter(a => a.status === 'Selected').length,
      rejected: placementApps.filter(a => a.status === 'Rejected').length
    };

    res.json({
      studentName: student.name,
      rollNumber: student.roll_number,
      classId: student.class_id,
      className: student.class_name || "N/A", // Need to ensure student model returns class_name
      semester: student.semester || "N/A",
      basePercentage: basePercentage.toFixed(2),
      leaveBonus: leaveBonus.toFixed(2),
      overallPercentage,
      totalClasses: records.length,
      attendedClasses: records.filter(r => r.status === 'present').length,
      totalLeaveDays,
      subjectWise: subjectWise.sort((a, b) => a.name.localeCompare(b.name)),
      placementStats // Add placement data here
    });

  } catch (err) {
    console.error("Student Stats Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.teacherStats = async (req, res) => {
  const { id } = req.params;
  try {
    const [subjectsCount] = await db.query("SELECT COUNT(DISTINCT subject) count FROM teacher_subjects WHERE teacher_id=?", [id]);
    const [classesCount] = await db.query("SELECT COUNT(DISTINCT class_id) count FROM teacher_subjects WHERE teacher_id=?", [id]);
    const pendingLeaves = await Leave.countPendingByTeacher(id);

    const [assignments] = await db.query(
      `SELECT t.id, t.class_id, c.name as class_name, t.subject, t.start_time, t.end_time,
       (SELECT COUNT(*) FROM attendance a 
        WHERE a.date = CURDATE() 
        AND a.subject = t.subject 
        AND (TIME_FORMAT(a.start_time, '%H:%i') = TIME_FORMAT(t.start_time, '%H:%i'))
        AND a.student_id IN (SELECT id FROM students WHERE class_id = t.class_id)
       ) > 0 as is_marked
       FROM timetable t JOIN classes c ON t.class_id = c.id
       WHERE t.teacher_id = ? AND t.day_of_week = ?
       ORDER BY t.start_time ASC`,
      [id, getDayName()]
    );

    res.json({
      assignedSubjects: subjectsCount[0].count,
      classesHandled: classesCount[0].count,
      pendingLeaves,
      todayStatus: assignments
    });
  } catch (err) {
    console.error("Teacher Stats Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

