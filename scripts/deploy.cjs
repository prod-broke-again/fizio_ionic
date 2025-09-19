#!/usr/bin/env node
/*
  CommonJS версия деплой‑скрипта.
  См. описание в deploy.js
*/

const { execSync } = require('node:child_process');
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

async function main() {
  const SSH_HOST = requireEnv('SSH_HOST');
  const SSH_USER = requireEnv('SSH_USER');
  const REMOTE_PATH = requireEnv('REMOTE_PATH');
  // Нормализуем путь public для удалённого Linux (всегда POSIX-слеши)
  const RAW_PUBLIC_PATH = process.env.PUBLIC_PATH && String(process.env.PUBLIC_PATH).trim().length > 0
    ? String(process.env.PUBLIC_PATH)
    : path.posix.join(REMOTE_PATH, 'public');
  const PUBLIC_PATH = RAW_PUBLIC_PATH.replace(/\\+/g, '/').replace(/\+/g, '/');
  const SSH_PORT = process.env.SSH_PORT || '22';
  const SSH_CONNECT_TIMEOUT = process.env.SSH_CONNECT_TIMEOUT || '15';
  const SSH_KEY = process.env.SSH_KEY;
  const SSH_PASSWORD = process.env.SSH_PASSWORD;
  const DEBUG = process.env.DEPLOY_DEBUG === '1';

  if (!existsSync('dist')) {
    console.error('Папка dist не найдена. Сначала выполните сборку: npm run build');
    process.exit(1);
  }

  const archive = 'dist.tar.gz';
  console.log('> Архивируем dist ...');
  sh(`tar -czf ${archive} dist`);
  const archiveSize = statSync(archive).size;
  if (DEBUG) {
    console.log(`> Архив готов: ${archive} (${(archiveSize/1024/1024).toFixed(2)} MB)`);
    console.log('> Конфиг:', {
      SSH_HOST,
      SSH_USER,
      SSH_PORT,
      REMOTE_PATH,
      PUBLIC_PATH,
      AUTH_MODE: SSH_KEY && !SSH_PASSWORD ? 'key' : 'password'
    });
  }

  const SSH_BASE = SSH_KEY
    ? `-i ${SSH_KEY} -p ${SSH_PORT} -o ConnectTimeout=${SSH_CONNECT_TIMEOUT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${SSH_USER}@${SSH_HOST}`
    : `-p ${SSH_PORT} -o ConnectTimeout=${SSH_CONNECT_TIMEOUT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${SSH_USER}@${SSH_HOST}`;

  const SCP_PREFIX = SSH_KEY
    ? `scp -P ${SSH_PORT} -o ConnectTimeout=${SSH_CONNECT_TIMEOUT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${SSH_KEY}`
    : `scp -P ${SSH_PORT} -o ConnectTimeout=${SSH_CONNECT_TIMEOUT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`;

  if (SSH_KEY && !SSH_PASSWORD) {
    console.log('> Проверка SSH соединения ...');
    sh(`ssh ${SSH_BASE} "echo connected"`);

    console.log('> Копируем архив на сервер ...');
    sh(`${SCP_PREFIX} ${archive} ${SSH_USER}@${SSH_HOST}:/tmp/${archive}`);

    console.log('> Разворачиваем на сервере ...');
    sh(`ssh ${SSH_BASE} "mkdir -p ${PUBLIC_PATH} && tar -xzf /tmp/${archive} -C ${PUBLIC_PATH} --strip-components=1 && rm /tmp/${archive}"`);

    const CLEAN_FLAG = process.env.DEPLOY_CLEAN === '1' ? ' --clean' : '';
    console.log('> Обновляем пути ассетов через artisan ...');
    sh(`ssh ${SSH_BASE} "cd ${REMOTE_PATH} && php artisan assets:update-spa --force${CLEAN_FLAG}"`);

    console.log('Готово ✅');
  } else {
    // Парольный режим: используем ssh2 + ssh2-sftp-client
    let SFTPClient, SSH2Client;
    try {
      SFTPClient = require('ssh2-sftp-client');
      SSH2Client = require('ssh2').Client;
    } catch (e) {
      console.error('Не найдены зависимости ssh2/ssh2-sftp-client. Установите:');
      console.error('npm i -D ssh2 ssh2-sftp-client');
      process.exit(1);
    }

    console.log('> Подключение по SFTP и загрузка архива ...');
    const sftp = new SFTPClient();
    await sftp.connect({
      host: SSH_HOST,
      port: Number(SSH_PORT),
      username: SSH_USER,
      password: SSH_PASSWORD,
      readyTimeout: Number(SSH_CONNECT_TIMEOUT) * 1000,
      // Автопринятие ключа хоста
      hostVerifier: () => true,
      algorithms: {
        serverHostKey: ['ssh-ed25519', 'ssh-rsa']
      }
    });
    if (DEBUG) console.log('> SFTP connected');
    await sftp.put(archive, `/tmp/${archive}`);
    if (DEBUG) console.log('> Upload complete:', `/tmp/${archive}`);
    await sftp.end();

    console.log('> Выполнение распаковки и artisan на сервере ...');
    await new Promise((resolve, reject) => {
      const conn = new SSH2Client();
      conn.on('ready', () => {
        const CLEAN_FLAG = process.env.DEPLOY_CLEAN === '1' ? ' --clean' : '';
        const cmd = `mkdir -p ${PUBLIC_PATH} && tar -xzf /tmp/${archive} -C ${PUBLIC_PATH} --strip-components=1 && rm /tmp/${archive} && cd ${REMOTE_PATH} && php artisan assets:update-spa --force${CLEAN_FLAG}`;
        if (DEBUG) console.log('> Remote CMD:', cmd);
        conn.exec(cmd, (err, stream) => {
          if (err) return reject(err);
          stream.on('data', (data) => process.stdout.write(data.toString()));
          stream.on('close', (code) => {
            conn.end();
            return code === 0 ? resolve(null) : reject(new Error(`Remote exit code ${code}`));
          }).stderr.on('data', (data) => process.stderr.write(data));
        });
      }).on('error', reject).connect({
        host: SSH_HOST,
        port: Number(SSH_PORT),
        username: SSH_USER,
        password: SSH_PASSWORD,
        readyTimeout: Number(SSH_CONNECT_TIMEOUT) * 1000,
        hostVerifier: () => true,
        algorithms: {
          serverHostKey: ['ssh-ed25519', 'ssh-rsa']
        }
      });
    });

    console.log('Готово ✅');
  }
}

main().catch((e) => {
  console.error('DEPLOY ERROR:', e);
  process.exit(1);
});


