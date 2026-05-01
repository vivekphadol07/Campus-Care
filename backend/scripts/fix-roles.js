require("dotenv").config();
const db = require("../config/db");

(async () => {
  try {
    console.log("⚙️ Fixing roles enum...");
    await db.query(`
      ALTER TABLE teachers 
      MODIFY COLUMN role ENUM('admin','teacher','mess_owner','placement_cell') DEFAULT 'teacher'
    `);
    console.log("✅ Roles updated successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Failed to update roles:", err);
    process.exit(1);
  }
})();
