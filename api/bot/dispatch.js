import { createBotDispatchHandler } from '../../server/trendingBotDispatch.js';

export default createBotDispatchHandler({ projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID });
