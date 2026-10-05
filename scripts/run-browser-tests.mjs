import process from 'node:process';

import { describeWebTool, enterTestRun, finishTestRun } from './prepare-test-run.mjs';
import { runProgram } from './run-program.mjs';

const INTERRUPTS = ['SIGINT', 'SIGTERM'];

runBrowserTests(process.argv.slice(2));

async function runBrowserTests(testFiles) {
  const testRun = enterTestRun();
  INTERRUPTS.forEach((signal) => process.on(signal, announceInterrupt));
  const exitCode = await runProgram(describeWebTool('playwright', ['test', ...testFiles]));
  finishTestRun(testRun);
  process.exit(exitCode);
}

function announceInterrupt() {
  process.stdout.write('\nStopping the browser tests and removing their data.\n');
}
