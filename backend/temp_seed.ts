
import { User, Student, Counselor, Booking, AvailabilitySlot } from './src/models/index.js';
import { sequelize } from './src/config/sequelize.js';

async function main() {
  try {
    await sequelize.authenticate();
    const studentUser = await User.findOne({ where: { email: 'solomonbzuneh1@gmail.com' } });
    const counselorUser = await User.findOne({ where: { email: 'sol123@gmail.com' } });

    if (!studentUser || !counselorUser) {
      console.log('Error: Users not found');
      return;
    }

    const student = await Student.findOne({ where: { userId: studentUser.id } });
    const counselor = await Counselor.findOne({ where: { userId: counselorUser.id } });

    if (!student || !counselor) {
      console.log('Error: Student or counselor profile not found');
      return;
    }

    for (let i = 1; i <= 2; i++) {
        const start = new Date();
        start.setDate(start.getDate() - i);
        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        const slot = await AvailabilitySlot.create({
            counselorId: counselor.id,
            startTime: start,
            endTime: end,
            status: 'booked'
        });

        await Booking.create({
      studentId: student.id,
            counselorId: counselor.id,
            slotId: slot.id,
            status: 'confirmed',
      meetingLink: 'https://meet.google.com/test-' + i
        });
    }
    console.log('SUCCESS: Sessions injected');
  } catch (err) { console.error(err); }
  process.exit(0);
}
main();
