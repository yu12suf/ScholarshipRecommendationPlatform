export interface SourceMetrics {
    sourceName: string;
    strategyUsed: string;
    linksFound: number;
    successfulIngestions: number;
    skippedDuplicates: number;
    skippedExpired: number;
    failedCount: number;
    startTime: number;
    endTime?: number;
}

export class IngestionMetrics {
    private static sessions: Map<string, SourceMetrics> = new Map();

    static startSession(sourceName: string) {
        this.sessions.set(sourceName, {
            sourceName,
            strategyUsed: 'INITIALIZING',
            linksFound: 0,
            successfulIngestions: 0,
            skippedDuplicates: 0,
            skippedExpired: 0,
            failedCount: 0,
            startTime: Date.now()
        });
    }

    static updateStrategy(sourceName: string, strategy: string) {
        const session = this.sessions.get(sourceName);
        if (session) session.strategyUsed = strategy;
    }

    static increment(sourceName: string, key: keyof Omit<SourceMetrics, 'sourceName' | 'strategyUsed' | 'startTime' | 'endTime'>) {
        const session = this.sessions.get(sourceName);
        if (session) {
            (session[key] as number)++;
        }
    }

    static setLinksFound(sourceName: string, count: number) {
        const session = this.sessions.get(sourceName);
        if (session) session.linksFound = count;
    }

    static endSession(sourceName: string) {
        const session = this.sessions.get(sourceName);
        if (session) {
            session.endTime = Date.now();
            const duration = ((session.endTime - session.startTime) / 1000).toFixed(2);

            console.log(`
--------------------------------------------------
METRICS FOR SOURCE: ${session.sourceName}
--------------------------------------------------
Strategy Used:     ${session.strategyUsed}
Links Found:       ${session.linksFound}
Success:           ${session.successfulIngestions}
Skipped (Dup):     ${session.skippedDuplicates}
Skipped (Exp):     ${session.skippedExpired}
Failed:            ${session.failedCount}
Execution Time:    ${duration}s
--------------------------------------------------
            `);

            this.sessions.delete(sourceName);
        }
    }

    static logIngestion(url: string, strategy: string, status: 'SUCCESS' | 'FAIL' | 'SKIP', reason?: string) {
        console.log(`[STRATEGY: ${strategy.padEnd(10)}] [${status.padEnd(7)}] ${url}${reason ? ` - Reason: ${reason}` : ''}`);
    }
}
