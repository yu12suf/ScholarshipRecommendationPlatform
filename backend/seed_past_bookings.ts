import { User, Counselor, Booking, AvailabilitySlot } from './src/models/index.js';
import { sequelize } from './src/config/sequelize.js';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const studentUser = await User.findOne({ where: { email: 'solomonbzuneh1@gmail.com' } });
    const counselorUser = await User.findOne({ where: { email: 'sol123@gmail.com' } });

    if (!studentUser) {
        console.error('Student solomonbzuneh1@gmail.com not found');
        return;
    }
    if (!counselorUser) {
        console.error('Counselor sol123@gmail.com not found');
        return;
    }

    const counselor = await Counselor.findOne({ where: { userId: counselorUser.id } });
    if (!counselor) {
        console.error('Counselor profile not found for user');
        return;
    }

    // Past Booking 1: Yesterday
    const date1 = new Date();
    date1.setDate(date1.getDate() - 1);
    const end1 = new Date(date1);
    end1.setHours(end1.getHours() + 1);

    const slot1 = await AvailabilitySlot.create({
        counselorId: counselor.id,
        startTime: date1,
        endTime: end1,
        status: 'booked'
    });

    await Booking.create({
        studentId: studentUser.id,
        counselorId: counselor.id,
        slotId: slot1.id,
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/past-session-1',
        topic: 'Past Session 1: Research Strategy'
    });

    // Past Booking 2: 2 days ago
    const date2 = new Date();
    date2.setDate(date2.getDate() - 2);
    const end2 = new Date(date2);
    end2.setHours(end2.getHours() + 1);

    const slot2 = await AvailabilitySlot.create({
        counselorId: counselor.id,
        startTime: date2,
        endTime: end2,
        status: 'booked'
    });

    await Booking.create({
        studentId: studentUser.id,
        counselorId: counselor.id,
        slotId: slot2.id,
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/past-session-2',
        topic: 'Past Session 2: Interview Prep'
    });

    console.log('Successfully ingested 2 past bookings for testing.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seed();