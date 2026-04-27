import { sequelize } from "../src/config/sequelize.js";
import { Booking, Counselor, Payment, Student, User } from "../src/models/index.js";

async function run() {
  const studentEmail = process.argv[2] || "solomonbzuneh1@gmail.com";
  const counselorEmail = process.argv[3] || "sol123@gmail.com";
  const bookingIdArg = process.argv[4] ? Number(process.argv[4]) : undefined;

  try {
    await sequelize.authenticate();

    const studentUser = await User.findOne({ where: { email: studentEmail } });
    const counselorUser = await User.findOne({ where: { email: counselorEmail } });

    if (!studentUser || !counselorUser) {
      throw new Error("Student or counselor user not found.");
    }

    const student = await Student.findOne({ where: { userId: studentUser.id } });
    const counselor = await Counselor.findOne({ where: { userId: counselorUser.id } });

    if (!student || !counselor) {
      throw new Error("Student or counselor profile not found.");
    }

    const booking = bookingIdArg
      ? await Booking.findOne({ where: { id: bookingIdArg, studentId: student.id, counselorId: counselor.id } })
      : await Booking.findOne({
          where: { studentId: student.id, counselorId: counselor.id },
          order: [["createdAt", "DESC"]],
        });

    if (!booking) {
      throw new Error("No matching booking found to prepare.");
    }

    let payment = booking.paymentId ? await Payment.findByPk(booking.paymentId) : null;

    if (!payment) {
      payment = await Payment.create({
        studentId: student.id,
        bookingId: booking.id,
        amount: 500,
        currency: "ETB",
        tx_ref: `test-review-${booking.id}-${Date.now()}`,
        status: "success",
        escrowStatus: "held",
      });
      await booking.update({ paymentId: payment.id });
    } else {
      await payment.update({ status: "success", escrowStatus: "held" });
    }

    await booking.update({
      status: "awaiting_confirmation",
      completedAt: booking.completedAt || new Date(),
    });

    console.log(
      JSON.stringify(
        {
          prepared: true,
          bookingId: booking.id,
          status: "awaiting_confirmation",
          paymentId: payment.id,
          paymentStatus: "success",
          escrowStatus: "held",
          message: "You can now call review-confirm as the STUDENT user for this booking.",
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error("Failed to prepare test booking:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
