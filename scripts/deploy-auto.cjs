#!/usr/bin/env node
/*
  Автоматический деплой-скрипт с использованием пароля
  Использует expect для автоматического ввода пароля
*/

const { execSync, spawn } = require('node:child_process');
const { existsSync, statSync } = require('node:fs');
const path = require('node:path');

// .env загрузка
try {
  const explicit = process.env.DEPLOY_ENV_FILE
    ? path.resolve(process.cwd(), process.env.DEPLOY_ENV_FILE)
    : null;
  const candidates = [explicit, path.resolve(process.cwd(), '.env.deploy'), path.resolve(process.cwd(), '.env')]
    .filter(Boolean)
    .filter((p) => existsSync(p));
  if (candidates.length > 0) {
    require('dotenv').config({ path: candidates[0] });
    console.log(`> Загружен конфиг из ${candidates[0]}`);
  } else {
    require('dotenv').config();
  }
} catch (e) {}

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    console.error(`Отсутствует переменная окружения ${name}`);
    process.exit(1);
  }
  return val;
}

async function main() {
  const SSH_HOST = requireEnv('SSH_HOST');
  const SSH_USER = requireEnv('SSH_USER');
  const REMOTE_PATH = requireEnv('REMOTE_PATH');
  const RAW_PUBLIC_PATH = process.env.PUBLIC_PATH && String(process.env.PUBLIC_PATH).trim().length > 0
    ? String(process.env.PUBLIC_PATH)
    : path.posix.join(REMOTE_PATH, 'public');
  const PUBLIC_PATH = RAW_PUBLIC_PATH.replace(/\\+/g, '/').replace(/\+/g, '/');
  const SSH_PORT = process.env.SSH_PORT || '22';
  const SSH_CONNECT_TIMEOUT = process.env.SSH_CONNECT_TIMEOUT || '15';
  const SSH_PASSWORD = process.env.SSH_PASSWORD;
  const DEBUG = process.env.DEPLOY_DEBUG === '1';

  if (!existsSync('dist')) {
    console.error('Папка dist не найдена. Сначала выполните сборку: npm run build');
    process.exit(1);
  }

  const archive = 'dist.tar.gz';
  console.log('> Архивируем dist ...');
  execSync(`tar -czf ${archive} dist`);
  const archiveSize = statSync(archive).size;
  if (DEBUG) {
    console.log(`> Архив готов: ${archive} (${(archiveSize/1024/1024).toFixed(2)} MB)`);
    console.log('> Конфиг:', {
      SSH_HOST,
      SSH_USER,
      SSH_PORT,
      REMOTE_PATH,
      PUBLIC_PATH,
      AUTH_MODE: 'password'
    });
  }

  if (!SSH_PASSWORD) {
    console.error('SSH_PASSWORD не указан в конфигурации');
    process.exit(1);
  }

  console.log('> Копируем архив на сервер ...');
  
  // Используем expect для автоматического ввода пароля
  const expectScript = `
    set timeout 30
    spawn scp -P ${SSH_PORT} -o ConnectTimeout=${SSH_CONNECT_TIMEOUT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${archive} ${SSH_USER}@${SSH_HOST}:/tmp/${archive}
    expect "password:"
    send "${SSH_PASSWORD}\\r"
    expect eof
  `;

  try {
    execSync(`echo '${expectScript}' | expect`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Ошибка при загрузке архива:', e.message);
    process.exit(1);
  }

  console.log('> Выполняем команды на сервере ...');
  
  const serverScript = `
    set timeout 30
    spawn ssh -p ${SSH_PORT} -o ConnectTimeout=${SSH_CONNECT_TIMEOUT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${SSH_USER}@${SSH_HOST} "mkdir -p ${PUBLIC_PATH} && tar -xzf /tmp/${archive} -C ${PUBLIC_PATH} --strip-components=1 && rm /tmp/${archive} && cd ${REMOTE_PATH} && php artisan assets:update-spa --force"
    expect "password:"
    send "${SSH_PASSWORD}\\r"
    expect eof
  `;

  try {
    execSync(`echo '${serverScript}' | expect`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Ошибка при выполнении команд на сервере:', e.message);
    process.exit(1);
  }

  console.log('Готово ✅');
}

main().catch((e) => {
  console.error('DEPLOY ERROR:', e);
  process.exit(1);
});
