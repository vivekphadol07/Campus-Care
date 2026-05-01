const db = require('../config/db');

async function fixSchema() {
    console.log("🛠️ Starting Schema Fix...");
    try {
        const columns = [
            { name: 'first_name', type: 'VARCHAR(100)' },
            { name: 'middle_name', type: 'VARCHAR(100)' },
            { name: 'last_name', type: 'VARCHAR(100)' },
            { name: 'mother_name', type: 'VARCHAR(100)' },
            { name: 'dob', type: 'DATE' },
            { name: 'gender', type: "ENUM('Male', 'Female', 'Other')" },
            { name: 'blood_group', type: 'VARCHAR(10)' },
            { name: 'mother_tongue', type: 'VARCHAR(50)' },
            { name: 'alternate_phone', type: 'VARCHAR(20)' },
            { name: 'nationality', type: 'VARCHAR(100)' },
            { name: 'domicile', type: 'VARCHAR(100)' },
            { name: 'religion', type: 'VARCHAR(100)' },
            { name: 'caste', type: 'VARCHAR(100)' },
            { name: 'category', type: 'VARCHAR(100)' },
            { name: 'hostelite', type: "ENUM('Yes', 'No')" },
            { name: 'marital_status', type: "ENUM('Single', 'Married')" },
            { name: 'prn_no', type: 'VARCHAR(50)' },
            { name: 'adhar_no', type: 'VARCHAR(20)' },
            { name: 'abc_id', type: 'VARCHAR(50)' },
            { name: 'admission_date', type: 'DATE' },
            { name: 'father_name', type: 'VARCHAR(100)' },
            { name: 'parent_phone', type: 'VARCHAR(20)' },
            { name: 'parent_occupation', type: 'VARCHAR(100)' },
            { name: 'address', type: 'TEXT' }
        ];

        // Get existing columns
        const [existingColumns] = await db.query("SHOW COLUMNS FROM student_profiles");
        const existingNames = existingColumns.map(c => c.Field);

        for (const col of columns) {
            if (!existingNames.includes(col.name)) {
                console.log(`➕ Adding column: ${col.name}`);
                await db.query(`ALTER TABLE student_profiles ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        console.log("✅ Schema Fix Completed!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Fix Failed:", err);
        process.exit(1);
    }
}

fixSchema();
