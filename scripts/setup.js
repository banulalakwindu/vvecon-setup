#!/usr/bin/env node
import inquirer from 'inquirer';
import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import cliProgress from 'cli-progress';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------
// Helper: Typing animation
// ----------------------------
async function typeWriter(message, delay = 20) {
    for (let char of message) {
        process.stdout.write(char);
        await new Promise(r => setTimeout(r, delay));
    }
    process.stdout.write('\n');
}

// ----------------------------
// Sound helpers
// ----------------------------
function beepSuccess() {
    process.stdout.write('\x07');
}

function beepFail() {
    process.stdout.write('\x07\x07');
}

// ----------------------------
// File & Command Utilities
// ----------------------------
function deleteDirectoryContents(dir) {
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) return;
    for (const item of fs.readdirSync(dir)) {
        if (item === '.' || item === '..') continue;
        const fullPath = path.join(dir, item);
        if (fs.lstatSync(fullPath).isDirectory()) {
            deleteDirectory(fullPath);
        } else {
            fs.unlinkSync(fullPath);
        }
    }
}

function deleteDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    if (!fs.lstatSync(dir).isDirectory()) return fs.unlinkSync(dir);
    for (const item of fs.readdirSync(dir)) {
        if (item === '.' || item === '..') continue;
        deleteDirectory(path.join(dir, item));
    }
    fs.rmdirSync(dir);
}

async function runCommand(command, args, stepLabel = '', spinnerText = '') {
    const spinner = ora(spinnerText || `${stepLabel} Running ${command}`).start();
    try {
        await execa(command, args, { stdio: 'inherit' });
        spinner.succeed(chalk.green(`${stepLabel} ✅ ${command} completed`));
        beepSuccess();
        process.stdout.write('\n'); // prevent overwriting
    } catch (err) {
        spinner.fail(chalk.red(`${stepLabel} ❌ ${command} failed`));
        beepFail();
        process.exit(1);
    }
}

// ----------------------------
// Console Display Helpers
// ----------------------------
async function printStepHeader(step, total, title) {
    console.log(chalk.bgBlue.white.bold(`\n\n STEP [${step}/${total}] `));
    await typeWriter(chalk.bold(`→ ${title}`), 20);
    console.log(chalk.gray('─'.repeat(50)));
}

async function randomMotivation() {
    const messages = [
        '🔥 Keep it up!',
        '🚀 Almost there!',
        '💡 Great choice!',
        '✨ Magic is happening...',
        '🎉 You are doing awesome!',
        '🏆 Victory is near!',
        '💪 You’ve got this!',
        '🌟 Shining bright!',
        '⚡ Powering through!',
        '📈 Progress unlocked!',
        '🎯 Right on target!',
        '🥇 Champion mindset!',
        '🧩 Every step counts!',
        '🌈 Keep pushing forward!',
        '🕹️ Leveling up!',
        '🌍 You’re making it happen!',
        '⏳ Patience pays off!',
        '🔥 Crushing it!',
        '🛠️ Building greatness!',
        '🚴 Keep moving forward!',
    ];
    await typeWriter(chalk.cyanBright('\n\n' + messages[Math.floor(Math.random() * messages.length)]) + '\n\n');
}

// ----------------------------
// Banner & Confetti
// ----------------------------
async function displayBanner() {
    try {
        await execa('npx', ['oh-my-logo', 'VVECON', 'dawn', '--filled', '--color'], { stdio: 'inherit' });
        process.stdout.write('\n'); // make sure it doesn't overwrite
    } catch {
    }
}

// ----------------------------
// Environment Check
// ----------------------------
function checkEnvironment() {
    // Load .env file if it exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    }

    const env = process.env.APP_ENV || 'local';
    const isProduction = env === 'production';

    if (isProduction) {
        console.log(chalk.red.bold('\n🚨 PRODUCTION ENVIRONMENT DETECTED! 🚨'));
        console.log(chalk.red('This setup script is designed for development environments only.'));
        console.log(chalk.red('Running this script in production may cause data loss or system issues.'));
        console.log(chalk.yellow('\nIf you are sure you want to continue, set APP_ENV=local'));
        process.exit(1);
    }

    return env;
}

// ----------------------------
// Main Setup Script
// ----------------------------
async function main() {
    console.clear();
    await displayBanner();
    await typeWriter(chalk.cyanBright.bold('VVECON Project Setup Wizard'), 20);
    await typeWriter(chalk.yellow.bold('🚀 Welcome to VVECON Project Setup Wizard!'), 20);

    let step = 1;
    const totalSteps = 11;

    const progressBar = new cliProgress.SingleBar({
        format: '\n\n' + 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% || Step {value}/{total}' + '\n\n',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    progressBar.start(totalSteps, 0);

    // ----------------------------
    // Step 1: Cleaning composer.lock
    await printStepHeader(step, totalSteps, 'Cleaning composer.lock');
    const composerLock = path.join(process.cwd(), 'composer.lock');
    if (fs.existsSync(composerLock)) await typeWriter(chalk.green('✓ composer.lock deleted'));
    else await typeWriter(chalk.yellow('⏩ No composer.lock found'));
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 2: Composer install (no scripts)
    await printStepHeader(step, totalSteps, 'Installing Composer dependencies (no-scripts)');
    await runCommand('composer', ['install', '--no-scripts', '--no-interaction', '--no-ansi'], `[2/${totalSteps}]`, 'Installing PHP dependencies...');
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 3: .env setup
    await printStepHeader(step, totalSteps, 'Setting up .env');
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        fs.copyFileSync(path.join(process.cwd(), '.env.example'), envPath);
        await typeWriter(chalk.green('✓ .env created'));
        await typeWriter(chalk.yellow('⚠️ Remember to update your .env settings!'));
        await runCommand('php', ['artisan', 'key:generate'], `[3/${totalSteps}]`, 'Generating APP_KEY...');
    } else {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        if (!/APP_KEY=.+/.test(envContent)) {
            await typeWriter(chalk.yellow('🔑 APP_KEY is empty or invalid, generating...'));
            await runCommand('php', ['artisan', 'key:generate'], `[3/${totalSteps}]`, 'Generating APP_KEY...');
        } else {
            await typeWriter(chalk.green('✓ .env exists and APP_KEY is valid'));
        }
    }

    // Environment check after .env is created/verified
    const currentEnv = checkEnvironment();
    await typeWriter(chalk.green(`✓ Environment check passed (${currentEnv})`), 20);

    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 4: Composer install (with scripts)
    await printStepHeader(step, totalSteps, 'Re-running Composer install (with scripts)');
    await runCommand('composer', ['install','--no-interaction', '--no-ansi'], `[4/${totalSteps}]`, 'Running composer scripts...');
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 5: Clean public/storage
    await printStepHeader(step, totalSteps, 'Cleaning public/storage');
    const storagePath = path.join(process.cwd(), 'public', 'storage');
    if (fs.existsSync(storagePath)) {
        deleteDirectoryContents(storagePath);
        deleteDirectory(storagePath);
        await typeWriter(chalk.green('✓ Removed public/storage'));
    } else await typeWriter(chalk.yellow('⏩ public/storage not found'));
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 6: php artisan storage:link
    await printStepHeader(step, totalSteps, 'Creating storage symlink');
    await runCommand('php', ['artisan', 'storage:link'], `[6/${totalSteps}]`, 'Creating storage symlink...');
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 7: Database migration
    await printStepHeader(step, totalSteps, 'Database migration');
    const { migrationOption } = await inquirer.prompt([
        {
            type: 'list',
            name: 'migrationOption',
            message: '🔄 Select database migration option:',
            choices: [
                { name: 'No', value: 'none' },
                { name: 'Run migrations only', value: 'migrate' },
                { name: 'Run fresh migrations (wipe database)', value: 'migrate:fresh' },
                { name: 'Run migrations with seeding', value: 'seed' },
                { name: 'Run fresh migrations with seeding', value: 'seed:fresh' },
            ],
            default: 0,
        },
    ]);
    switch (migrationOption) {
        case 'migrate':
            await runCommand('php', ['artisan', 'migrate'], `[7/${totalSteps}]`, 'Running migrations...');
            break;
        case 'migrate:fresh':
            await runCommand('php', ['artisan', 'migrate:fresh'], `[7/${totalSteps}]`, 'Running fresh migrations...');
            break;
        case 'seed':
            await runCommand('php', ['artisan', 'migrate'], `[7/${totalSteps}]`, 'Running migrations...');
            await runCommand('php', ['artisan', 'db:seed'], `[7/${totalSteps}]`, 'Seeding database...');
            break;
        case 'seed:fresh':
            await runCommand('php', ['artisan', 'migrate:fresh', '--seed'], `[7/${totalSteps}]`, 'Running fresh migrations with seed...');
            break;
        default:
            await typeWriter(chalk.yellow('⏩ Skipping database migration'));
    }
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 8: Cache icons
    await printStepHeader(step, totalSteps, 'Caching icons');
    await runCommand('php', ['artisan', 'icon:cache'], `[8/${totalSteps}]`, 'Caching icons...');
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 9: Build frontend assets
    await printStepHeader(step, totalSteps, 'Frontend asset build');
    const { buildAssets } = await inquirer.prompt([
        {
            type: 'list',
            name: 'buildAssets',
            message: '🎨 Do you want to build frontend assets?',
            choices: [
                { name: 'No, skip it 😴', value: false },
                { name: 'Yes, let’s do it 🚀', value: true },
            ],
            default: 0,
        },
    ]);
    if (buildAssets) await runCommand('npm', ['run', 'build'], `[9/${totalSteps}]`, 'Building frontend assets...');
    else await typeWriter(chalk.yellow('⏩ Skipping frontend build'));
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 10: Production optimizations
    await printStepHeader(step, totalSteps, 'Production optimizations');
    const { runProd } = await inquirer.prompt([
        {
            type: 'list',
            name: 'runProd',
            message: '🚀 Do you want to run production optimizations?',
            choices: [
                { name: 'No, skip it 😴', value: false },
                { name: 'Yes, optimize 🚀', value: true },
            ],
            default: 0,
        },
    ]);
    if (runProd) {
        const prodCommands = [
            ['php', ['artisan', 'config:cache']],
            ['php', ['artisan', 'route:cache']],
            ['php', ['artisan', 'view:cache']],
            ['php', ['artisan', 'optimize']],
            ['php', ['artisan', 'filament:cache-components']],
        ];
        for (const [cmd, args] of prodCommands) {
            await runCommand(cmd, args, `[10/${totalSteps}]`, 'Optimizing production...');
        }
    } else await typeWriter(chalk.yellow('⏩ Skipping production optimizations'));
    await randomMotivation();
    step++;
    progressBar.update(step - 1);

    // Step 11: Complete
    progressBar.stop(); // important: stop before printing final messages

    process.stdout.write('\n');

    console.clear();

    await typeWriter(chalk.magentaBright.bold('\n🎉 VVECON setup completed successfully! 🎉'));
    console.log(chalk.gray('─'.repeat(50)));
    await typeWriter(chalk.cyanBright.bold('📋 Next steps:'));
    await typeWriter('• Run "composer run dev" to start the development server');
    await typeWriter('• Visit your app in the browser');
    await typeWriter('• Explore README documentation');
    await typeWriter(chalk.green.bold('\n💻 Happy coding with VVECON!'));

    await displayBanner(); // final banner, now safe
}

main();