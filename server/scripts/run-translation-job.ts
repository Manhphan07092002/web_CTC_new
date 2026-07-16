/**
 * Run translation job manually
 * Usage: npx tsx server/scripts/run-translation-job.ts
 */

import { runTranslationJob } from '../services/translationScheduler';

console.log('🚀 Starting manual translation job...\n');

runTranslationJob()
  .then((stats) => {
    console.log('\n✅ Translation job completed!');
    console.log('Stats:', stats);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Translation job failed:', error);
    process.exit(1);
  });
