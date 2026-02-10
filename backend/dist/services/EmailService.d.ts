export declare class EmailService {
    private static transporter;
    static sendPasswordResetEmail(to: string, token: string): Promise<void>;
    static sendPasswordChangedNotification(to: string): Promise<void>;
    static sendAccountDeactivatedEmail(to: string, name: string): Promise<void>;
}
//# sourceMappingURL=EmailService.d.ts.map