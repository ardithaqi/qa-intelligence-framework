import "dotenv/config";
import { analyzeLatestFailure } from "./failureAnalyzer";

analyzeLatestFailure().catch(console.error);