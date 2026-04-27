import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'edupathway',
  dialect: 'postgres',
  logging: false
});

async function run() {
  try {
    await sequelize.authenticate();
    const [users] = await sequelize.query(`SELECT id, email FROM users WHERE email = 'sol123@gmail.com'`);
    if (users.length > 0) {
      const user = users[0];
      console.log("Found User:", user);
      const [counselors] = await sequelize.query(`SELECT id, pending_balance, total_earned FROM counselors WHERE user_id = ${user.id}`);
      console.log("Counselor Wallet:", counselors[0]);
      
      if (counselors.length > 0) {
        const counselorId = counselors[0].id;
        const [transactions] = await sequelize.query(`SELECT * FROM counselor_wallet_transactions WHERE counselor_id = ${counselorId}`);
        console.log("Transactions:", transactions);

        const [bookings] = await sequelize.query(`SELECT id, status, payment_id FROM bookings WHERE counselor_id = ${counselorId}`);
        console.log("Bookings:", bookings);
      }
    } else {
      console.log("User not found");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}

run();
