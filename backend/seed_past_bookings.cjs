const { User, Counselor, Booking, Slot } = require('./src/models');
const { sequelize } = require('./src/config/sequelize');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const studentUser = await User.findOne({ where: { email: 'solomonbzuneh1@gmail.com' } });
    const counselorUser = await User.findOne({ where: { email: 'sol123@gmail.com' } });

    if (!studentUser) {
        console.error('Student user solomonbzuneh1@gmail.com not found');
        return;
    }
    if (!counselorUser) {
        console.error('Counselor user sol123@gmail.com not found');
        return;
    }

    const counselor = await Counselor.findOne({ where: { userId: counselorUser.id } });
    if (!counselor) {
      console.error('Counselor record not found for ' + counselorUser.email);
      return;
    }

    // Create 2 past slots and bookings
    for (let i = 1; i <= 2; i++) {
        const pastDate = new Date();
        pastDate.setHours(pastDate.getHours() - (24 * i)); // 1 and 2 days ago
        const pastEndDate = new Date(pastDate);
        pastEndDate.setHours(pastEndDate.getHours() + 1);

        const slot = await Slot.create({
            counselorId: counselor.id,
            startTime: pastDate,
            endTime: pastEndDate,
            status: 'booked'
        });

        const booking = await Booking.create({
            studentId: studentUser.id,
            counselorId: counselor.id,
            slotId: slot.id,
            status: 'confirmed',
            meetingLink: `https://meet.google.com/test-session-${i}`,
            topic: `Past Trial Session #${i}`
        });

        console.log(`Created past booking ID: ${booking.id} (Slot ID: ${slot.id})`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seed();