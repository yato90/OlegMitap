import 'dotenv/config';

export const BOT_TOKEN = process.env.BOT_TOKEN as string;

if (!BOT_TOKEN) {
  throw new Error('Необходимо указать BOT_TOKEN в файле .env');
}
