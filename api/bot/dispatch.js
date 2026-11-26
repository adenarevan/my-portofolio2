import { createBotDispatchHandler } from '../../server/trendingBotDispatch.js';
import { resolveFirebaseConfig } from '../../src/lib/firebaseConfig.js';

export default createBotDispatchHandler({ projectId: process.env.FIREBASE_PROJECT_ID || resolveFirebaseConfig(process.env).projectId });
