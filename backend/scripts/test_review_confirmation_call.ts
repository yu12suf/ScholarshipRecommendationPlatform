import { sequelize } from "../src/config/sequelize.js";
import { CounselorService } from "../src/services/CounselorService.js";
import { User } from "../src/models/index.js";

async function run() {
  try {
    await sequelize.authenticate();

    const studentUser = await User.findOne({ where: { email: "solomonbzuneh1@gmail.com" } });
    if (!studentUser) {
      throw new Error("Student user not found.");
    }

    const result = await CounselorService.reviewAndConfirmBooking(studentUser.id, 76, {
      rating: 5,
      comment: "Test confirmation succeeded",
    });

    console.log(JSON.stringify({ ok: true, bookingId: result.id, status: result.status }, null, 2));
  } catch (error: any) {
    console.error("REVIEW_CONFIRM_FAILED", error?.message || error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
