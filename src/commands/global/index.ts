import { Context } from 'telegraf';

export let GROUP_ID: number | null = null;

export const testCommand = (ctx: Context) => {
  ctx.reply('Все работает :)');
};

export const startIdCommand = (ctx: Context) => {
  const chat = ctx.chat;
  if (chat && (chat.type === 'group' || chat.type === 'supergroup')) {
    GROUP_ID = chat.id;
    console.log(`Бот добавлен в группу с chat_id: ${GROUP_ID}`);
    ctx.reply('ID группы успешно зарегистрирован.');
  } else {
    ctx.reply('Эта команда должна быть выполнена в группе.');
  }
};
