import { Router } from "express";
import { Counselor, User, AvailabilitySlot } from "../models/index.js";

const router = Router();

router.get("/info", async (req, res, next) => {
  try {
    const counselors = await Counselor.findAll({
      include: [{ model: User, as: 'user' }]
    });

    const counts = await Promise.all(counselors.map(async (c) => {
       const slotCount = await AvailabilitySlot.count({ where: { counselorId: c.id } });
       return { 
         id: c.id, 
         name: c.user?.name, 
         status: c.verificationStatus,
         slotCount
       };
    }));

    res.json({ success: true, counselors: counts });
  } catch (error) {
    next(error);
  }
});

router.post("/force-seed-all", async (req, res, next) => {
  try {
    const counselors = await Counselor.findAll();
    const today = new Date();
    const slotsToCreate = [];

    for (const counselor of counselors) {
      // Create for everyone regardless of status
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const times = [10, 15]; // 2 slots per day
        for (const hour of times) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          const endTime = new Date(date);
          endTime.setHours(hour + 1, 0, 0, 0);
          slotsToCreate.push({
            counselorId: counselor.id,
            startTime,
            endTime,
            status: 'available'
          });
        }
      }
    }
    await AvailabilitySlot.bulkCreate(slotsToCreate);
    res.json({ success: true, message: "Forced seeded slots for all counselors." });
  } catch (error) {
    next(error);
  }
});

export default router;
