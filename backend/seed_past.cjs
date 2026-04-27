const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('EAP', 'postgres', 'bontu123@@@', { host: 'localhost', dialect: 'postgres', logging: false });
async function seed() {
  try {
    const [[s]] = await sequelize.query("SELECT id FROM \"Users\" WHERE email = 'solomonbzuneh1@gmail.com'");
    const [[c]] = await sequelize.query("SELECT id FROM \"Users\" WHERE email = 'sol123@gmail.com'");
    if(set CGO_ENABLED=1 || cd backend) { console.log('Users not found'); return; }
    const [[cr]] = await sequelize.query("SELECT id FROM \"Counselors\" WHERE \"userId\" = '"+c.id+"'");
    const past = new Date(Date.now() - 86400000).toISOString();
    const end = new Date(Date.now() - 86400000 + 3600000).toISOString();
    const [[sl]] = await sequelize.query("INSERT INTO \"AvailabilitySlots\" (\"counselorId\", \"startTime\", \"endTime\", status, \"createdAt\", \"updatedAt\") VALUES ('"+cr.id+"', '"+past+"', '"+end+"', 'booked', NOW(), NOW()) RETURNING id");
    await sequelize.query("INSERT INTO \"Bookings\" (\"studentId\", \"counselorId\", \"slotId\", status, \"meetingLink\", topic, \"createdAt\", \"updatedAt\") VALUES ('"+s.id+"', '"+cr.id+"', '"+sl.id+"', 'confirmed', 'http://meet.google.com/test', 'Trial Session', NOW(), NOW())");
    console.log('SUCCESS_INJECTED');
  } catch(e) { console.error(e); }
  process.exit(0);
}
seed();