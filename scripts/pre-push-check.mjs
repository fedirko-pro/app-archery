import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const run = (command) => {
  execSync(command, { stdio: 'inherit' });
};

if (platform() === 'win32') {
  console.log(
    'Windows: skipping standalone next build (symlinks require Developer Mode). Running typecheck + lint...',
  );
  run('npm run typecheck');
  run('npm run lint');
} else {
  run('npm run build');
}
