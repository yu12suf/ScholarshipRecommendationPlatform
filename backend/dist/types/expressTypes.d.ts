import { JwtPayload } from "./authTypes";
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
//# sourceMappingURL=expressTypes.d.ts.map