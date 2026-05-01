require("dotenv").config();
const db = require("../config/db");

(async () => {
  try {
    console.log("🔄 Updating student data: Setting Current Year to 'TE'...");

    // 1. Identify students in classes starting with 'TE'
    const [teClasses] = await db.query("SELECT id, name FROM classes WHERE name LIKE 'TE%'");
    
    if (teClasses.length > 0) {
      const classIds = teClasses.map(c => c.id);
      
      // Update core students table
      await db.query(`
        UPDATE students 
        SET branch = 'Computer Engineering', year = 'TE', semester = '6th'
        WHERE class_id IN (?)
      `, [classIds]);
      console.log(`✅ Updated students table: year set to 'TE' for ${teClasses.length} classes`);

      // Update student_profiles table
      await db.query(`
        UPDATE student_profiles sp
        JOIN students s ON sp.student_id = s.id
        SET sp.branch = 'Computer Engineering', sp.year = 'TE', sp.semester = '6th'
        WHERE s.class_id IN (?)
      `, [classIds]);
      console.log(`✅ Updated student_profiles table`);
    } else {
        console.log("⚠️ No classes starting with 'TE' found.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Update failed:", err);
    process.exit(1);
  }
})();
