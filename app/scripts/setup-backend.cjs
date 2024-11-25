// scripts/setup-backend.js
const { spawn } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';
const command = isWindows ? 
  ['powershell', ['-ExecutionPolicy', 'Bypass', '-File', 'scripts/setup-backend.ps1']] :
  ['bash', ['app/scripts/setup-backend.sh']];

const setup = spawn(command[0], command[1], { stdio: 'inherit' });

setup.on('error', (err) => {
  console.error(`Failed to start: ${err}`);
  process.exit(1);
});

setup.on('exit', (code) => {
  process.exit(code);
});