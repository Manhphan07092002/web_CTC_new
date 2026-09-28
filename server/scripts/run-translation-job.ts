/**
 * Run translation job manually
 * Usage: npx tsx server/scripts/run-translation-job.ts
 */

import { runTranslationJob } from '../services/translationScheduler';
import { logger } from "../../utils/logger";

logger.log('🚀 Starting manual translation job...\n');

runTranslationJob()
  .then((stats) => {
    logger.log('\n✅ Translation job completed!');
    logger.log('Stats:', stats);
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Translation job failed:', error);
    process.exit(1);
  });
