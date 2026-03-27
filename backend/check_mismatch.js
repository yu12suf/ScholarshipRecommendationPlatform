// check_mismatch.js
import { Scholarship } from './src/models/Scholarship.js';
import { Student } from './src/models/Student.js';
import { MatchingService } from './src/services/MatchingService.js';
import { startSequelize } from './src/config/sequelize.js';

async function test() {
    try {
        await startSequelize();
        const students = await Student.findAll({ limit: 5 });
        if (!students.length) {
            console.log("No students found.");
            return;
        }

        for (const student of students) {
            console.log(`\n--- Matches for Student ID ${student.userId} ---`);
            // Corrected syntax bug here
            const matches = await MatchingService.getTopMatches(student.userId);
            console.log(`Number of matches: ${matches.length}`);
            
            for (const m of matches.slice(0, 5)) {
                // Cast m.id to number explicitly if needed
                const details = await MatchingService.getMatchById(student.userId, Number(m.id));
                console.log(`ID ${m.id}: ListTitle="${m.title.substring(0, 30)}", DetailsTitle="${details?.title.substring(0, 30)}"`);
                if (m.title !== details?.title) {
                    console.log(`  !!! FAIL: TITLE MISMATCH !!!`);
                    console.log(`  Expected ID: ${m.id}`);
                    console.log(`  Returned Details: ${JSON.stringify(details, null, 2)}`);
                } else {
                    console.log(`  PASS: Titles match. MatchScores: List=${m.matchScore}%, Details=${details?.matchScore}%`);
                }
            }
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
