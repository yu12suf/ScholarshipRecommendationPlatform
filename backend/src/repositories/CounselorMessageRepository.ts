import { Op, Order } from "sequelize";
import { CounselorMessage } from "../models/CounselorMessage.js";

export class CounselorMessageRepository {
  static async create(data: {
    senderUserId: number;
    recipientUserId: number;
    body: string;
  }): Promise<CounselorMessage> {
    return CounselorMessage.create(data);
  }

  static async findThread(userAId: number, userBId: number): Promise<CounselorMessage[]> {
    return CounselorMessage.findAll({
      where: {
        [Op.or]: [
          { senderUserId: userAId, recipientUserId: userBId },
          { senderUserId: userBId, recipientUserId: userAId },
        ],
      },
      order: [["createdAt", "ASC"]] as Order,
    });
  }
}
