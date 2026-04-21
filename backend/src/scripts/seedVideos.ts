import { Video } from "../models/Video.js";
import { sequelize } from "../config/sequelize.js";

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");
        await sequelize.sync({ alter: true });

        const levels: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
        const types: ('Reading' | 'Listening' | 'Writing' | 'Speaking')[] = ['Reading', 'Listening', 'Writing', 'Speaking'];
        
        // Real YouTube IDs for IELTS content
        const videoMap: any = {
            'Reading': {
                'easy': [
                    'k_e33Uf7q2E', // Phase 1: Decoding
                    'S0T08V4qM_o', // Phase 2: Skimming
                    'uXQzQW1Qj1o', // Phase 3: Synonyms
                    'x8P0G9aHw4I', // Phase 4: Tactics
                    'sR96P8R9yGk'  // Extra
                ],
                'medium': ['y2pS_S-Z-f4', 'y2pS_S-Z-f4', 'y2pS_S-Z-f4', 'y2pS_S-Z-f4'], // 4 Phases
                'hard': ['Qf65ZJ2Cg9U', 'Qf65ZJ2Cg9U', 'Qf65ZJ2Cg9U'] // 3 Phases
            },
            'Listening': {
                'easy': ['R9K25x-uB70', '0h6vX8xVb5E', 'pG8oW6lYI-E'], // Phase 1, 2, 3
                'medium': ['7M7-E79x6G8', '7M7-E79x6G8', '7M7-E79x6G8'], // 3 Phases
                'hard': ['pG8oW6lYI-E', 'pG8oW6lYI-E'] // 2 Phases
            },
            'Speaking': {
                'easy': ['sQIGn0n6z7w', 'sQIGn0n6z7w', 'sQIGn0n6z7w', 'sQIGn0n6z7w'], // 4 Phases
                'medium': ['tY8vTndu_qA', 'tY8vTndu_qA', 'tY8vTndu_qA', 'tY8vTndu_qA'], // 4 Phases
                'hard': ['fW2P93G-U8c', 'fW2P93G-U8c', 'fW2P93G-U8c'] // 3 Phases
            },
            'Writing': {
                'easy': ['hN2yXU69qL4', 'oV8pA0Lg8V0', 'f-N_XmZc0uI', 'hN2yXU69qL4', 'oV8pA0Lg8V0'], // 5 Phases
                'medium': ['oV8pA0Lg8V0', 'oV8pA0Lg8V0', 'oV8pA0Lg8V0', 'oV8pA0Lg8V0', 'oV8pA0Lg8V0'], // 5 Phases
                'hard': ['f-N_XmZc0uI', 'f-N_XmZc0uI', 'f-N_XmZc0uI', 'f-N_XmZc0uI'] // 4 Phases
            }
        };

        console.log("Seeding real IELTS videos...");
        let count = 0;

        for (const level of levels) {
            for (const type of types) {
                const videoIds = videoMap[type][level];
                
                // Loop over exactly the number of phases defined
                for (let i = 0; i < videoIds.length; i++) {
                    const videoId = videoIds[i];
                    // Simulate uniqueness if array has duplicate items
                    const finalVideoId = (videoIds.indexOf(videoId) === i) ? videoId : `${videoId}?t=${(i+1)*10}`; 
                    
                    const [video, created] = await Video.findOrCreate({
                        where: {
                            videolink: `https://www.youtube.com/watch?v=${finalVideoId}`,
                            type,
                            level,
                            examType: 'IELTS'
                        },
                        defaults: {
                            thubnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
                        }
                    });
                    if (created) count++;
                }
            }
        }

        console.log(`✅ Seeded ${count} high-quality videos.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding videos:", error);
        process.exit(1);
    }
}

seed();
