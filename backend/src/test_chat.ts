import { connectSequelize } from './config/sequelize.js';
import { ChatService } from './services/ChatService.js';

async function main() {
    await connectSequelize();
    // Use an existing user ID, assuming ID 1 exists
    const convs = await ChatService.getConversations(1);
    console.log(JSON.stringify(convs, null, 2));
    process.exit(0);
}

main().catch(console.error);
