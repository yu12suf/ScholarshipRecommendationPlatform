import { Op } from "sequelize";
import { sequelize } from "../src/config/sequelize.js";
import { AvailabilitySlot, Booking, Counselor, Payment, Student, User } from "../src/models/index.js";

async function run() {
  const studentEmail = process.argv[2] || "solomonbzuneh1@gmail.com";
  const counselorEmail = process.argv[3] || "sol123@gmail.com";

  try {
    await sequelize.authenticate();

    const studentUser = await User.findOne({ where: { email: studentEmail } });
    const counselorUser = await User.findOne({ where: { email: counselorEmail } });

    if (!studentUser || !counselorUser) {
      console.log("Student or counselor user not found.");
      return;
    }

    const student = await Student.findOne({ where: { userId: studentUser.id } });
    const counselor = await Counselor.findOne({ where: { userId: counselorUser.id } });

    if (!student || !counselor) {
      console.log("Student or counselor profile not found.");
      return;
    }

    const bookings = await Booking.findAll({
      where: {
        studentId: student.id,
        counselorId: counselor.id,
        status: { [Op.in]: ["confirmed", "started", "awaiting_confirmation", "completed"] },
      },
      include: [
        { model: AvailabilitySlot, as: "slot", required: false },
        { model: Payment, as: "payment", required: false },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!bookings.length) {
      console.log("No matching bookings found.");
      return;
    }

    for (const booking of bookings) {
      const statusOk = ["awaiting_confirmation", "started", "completed"].includes(booking.status);
      const paymentOk = booking.payment?.status === "success";
      const escrowOk = booking.payment?.escrowStatus === "held";
      const ready = statusOk && paymentOk && escrowOk;

      console.log(
        JSON.stringify(
          {
            bookingId: booking.id,
            status: booking.status,
            slotStart: booking.slot?.startTime || null,
            slotEnd: booking.slot?.endTime || null,
            meetingLink: booking.meetingLink,
            paymentId: booking.paymentId,
            paymentStatus: booking.payment?.status || null,
            escrowStatus: booking.payment?.escrowStatus || null,
            reviewReady: ready,
          },
          null,
          2,
        ),
      );
    }
  } catch (error) {
    console.error("Failed to check review readiness:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
