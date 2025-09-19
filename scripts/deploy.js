#!/usr/bin/env node
/*
  Простой деплойер через SSH:
  - Требует переменные окружения:
    SSH_HOST, SSH_USER, SSH_PORT (необяз.), SSH_KEY (путь к приватному ключу) или SSH_PASSWORD
    REMOTE_PATH (корень проекта на сервере, например: /var/www/fizio)
    PUBLIC_PATH (путь до public, например: /var/www/fizio/public)
  - Действия:
    1) zlip папку dist
    2) копия на сервер в /tmp
    3) распаковка в PUBLIC_PATH
    4) php artisan assets:update-spa (в REMOTE_PATH)
*/

const { execSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

// Поддержка .env файлов.
// Приоритет: DEPLOY_ENV_FILE -> .env.deploy -> .env
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
    // Попытка стандартной загрузки .env, если он появится позже
    require('dotenv').config();
  }
} catch (e) {
  // не фейлимся, если dotenv отсутствует
}

function sh(cmd) {
  return execSync(cmd, { stdio: 'inherit' });
}

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    console.error(`Отсутствует переменная окружения ${name}`);
    process.exit(1);
  }
  return val;
}

function main() {
  const SSH_HOST = requireEnv('SSH_HOST');
  const SSH_USER = requireEnv('SSH_USER');
  const REMOTE_PATH = requireEnv('REMOTE_PATH');
  const PUBLIC_PATH = process.env.PUBLIC_PATH || path.join(REMOTE_PATH, 'public');
  const SSH_PORT = process.env.SSH_PORT || '22';
  const SSH_KEY = process.env.SSH_KEY; // путь к приватному ключу
  const SSH_PASSWORD = process.env.SSH_PASSWORD; // альтернативно, если используется пароль

  if (!existsSync('dist')) {
    console.error('Папка dist не найдена. Сначала выполните сборку: npm run build');
    process.exit(1);
  }

  const archive = 'dist.tar.gz';
  console.log('> Архивируем dist ...');
  sh(`tar -czf ${archive} dist`);

  const SSH_BASE = SSH_KEY
    ? `-i ${SSH_KEY} -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST}`
    : `-p ${SSH_PORT} ${SSH_USER}@${SSH_HOST}`;

  const SCP_PREFIX = SSH_KEY
    ? `scp -P ${SSH_PORT} -i ${SSH_KEY}`
    : `scp -P ${SSH_PORT}`;

  console.log('> Копируем архив на сервер ...');
  sh(`${SCP_PREFIX} ${archive} ${SSH_USER}@${SSH_HOST}:/tmp/${archive}`);

  console.log('> Разворачиваем на сервере ...');
  sh(`ssh ${SSH_BASE} "mkdir -p ${PUBLIC_PATH} && tar -xzf /tmp/${archive} -C ${PUBLIC_PATH} --strip-components=1 && rm /tmp/${archive}"`);

  console.log('> Обновляем пути ассетов через artisan ...');
  sh(`ssh ${SSH_BASE} "cd ${REMOTE_PATH} && php artisan assets:update-spa --no-interaction || php artisan assets:update-spa"`);

  console.log('Готово ✅');
}

main();


