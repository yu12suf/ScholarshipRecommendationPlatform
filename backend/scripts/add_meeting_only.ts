import { Op } from "sequelize";
import { sequelize } from "../src/config/sequelize.js";
import { AvailabilitySlot, Booking, Counselor, Student, User } from "../src/models/index.js";

type Args = {
  studentEmail: string;
  counselorEmail: string;
  meetingBase: string;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);

  const getValue = (flag: string, fallback: string) => {
    const idx = args.indexOf(flag);
    if (idx >= 0 && args[idx + 1]) return args[idx + 1];
    return fallback;
  };

  return {
    studentEmail: getValue("--student", "solomonbzuneh1@gmail.com"),
    counselorEmail: getValue("--counselor", "sol123@gmail.com"),
    meetingBase: getValue("--meeting", "https://meet.google.com/test-session"),
  };
}

async function run() {
  const { studentEmail, counselorEmail, meetingBase } = parseArgs();
  const now = new Date();

  try {
    await sequelize.authenticate();

    const studentUser = await User.findOne({ where: { email: studentEmail } });
    const counselorUser = await User.findOne({ where: { email: counselorEmail } });

    if (!studentUser) {
      throw new Error(`Student user not found for email: ${studentEmail}`);
    }
    if (!counselorUser) {
      throw new Error(`Counselor user not found for email: ${counselorEmail}`);
    }

    const student = await Student.findOne({ where: { userId: studentUser.id } });
    const counselor = await Counselor.findOne({ where: { userId: counselorUser.id } });

    if (!student) {
      throw new Error(`Student profile not found for user id: ${studentUser.id}`);
    }
    if (!counselor) {
      throw new Error(`Counselor profile not found for user id: ${counselorUser.id}`);
    }

    const bookings = await Booking.findAll({
      where: {
        studentId: student.id,
        counselorId: counselor.id,
        status: {
          [Op.in]: ["confirmed", "started", "awaiting_confirmation", "completed"],
        },
      },
      include: [
        {
          model: AvailabilitySlot,
          as: "slot",
          required: true,
          where: {
            endTime: { [Op.lt]: now },
          },
        },
      ],
      order: [[{ model: AvailabilitySlot, as: "slot" }, "startTime", "DESC"]],
    });

    if (!bookings.length) {
      console.log("No past bookings found for the provided student and counselor emails.");
      return;
    }

    let updatedCount = 0;

    for (const booking of bookings) {
      const meetingLink = `${meetingBase}-${booking.id}`;

      await booking.update({ meetingLink });

      if (booking.slot) {
        await booking.slot.update({ meetingLink });
      }

      updatedCount += 1;
      console.log(
        `Updated booking ${booking.id} with meeting link: ${meetingLink} (slot ${booking.slot?.id ?? "n/a"})`,
      );
    }

    console.log(`Done. Updated ${updatedCount} past booking(s).`);
  } catch (error) {
    console.error("Failed to add meeting links:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
