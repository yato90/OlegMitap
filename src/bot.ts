import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from './config/config';
import { testCommand, startIdCommand, GROUP_ID } from './commands/global/index';
import {
  addNoteCommand,
  editNoteCommand,
  deleteNoteCommand,
  getNoteCommand,
  getAllNotesCommand,
  handleNoteInput,
  cancelActionHandler,
} from './commands/noteController/noteController';
import {
  setScheduleCommand,
  getScheduleCommand,
} from './commands/scheduleController/scheduleController';
import {
  updateSchedule,
  initializeDefaultSchedule,
  getScheduleFromDatabase,
} from './utils/scheduleUtils';
import { callbackQuery } from 'telegraf/filters';
import { scheduleDailyTasks } from './services/scheduleService';

const bot = new Telegraf(BOT_TOKEN);
let selectedDay: string | null = null;
bot.telegram.setMyCommands([
  { command: 'test', description: 'Тестовая команда' },
  { command: 'start_id', description: 'Зарегистрировать ID группы для бота' },
  { command: 'set_schedule', description: 'Установить расписание' },
  { command: 'get_schedule', description: 'Показать акутальное расписание' },
  { command: 'add_note', description: 'Добавить заметку' },
  { command: 'edit_note', description: 'Редактировать заметку' },
  { command: 'delete_note', description: 'Удалить заметку' },
  { command: 'get_note', description: 'Получить заметку' },
  { command: 'get_notes', description: 'Показать все заметки' },
]);
// Инициализация дефолтного расписания при запуске бота
initializeDefaultSchedule()
  .then(() => console.log('Иницализация бд'))
  .catch((error) =>
    console.error('Ошибка при инициализации расписания:', error),
  );

bot.command('test', testCommand);
bot.command('start_id', startIdCommand);
bot.command('set_schedule', setScheduleCommand);
bot.command('get_schedule', getScheduleCommand); // Команда теперь получает данные из базы данных

bot.command('add_note', addNoteCommand);
bot.command('edit_note', editNoteCommand);
bot.command('delete_note', deleteNoteCommand);
bot.command('get_note', getNoteCommand);
bot.command('get_notes', getAllNotesCommand);

bot.action(/^(Пн|Вт|Ср|Чт|Пт)$/, (ctx) => {
  if (!ctx.has(callbackQuery('data'))) {
    return;
  }
  const day = ctx.callbackQuery?.data;
  if (!day) return;
  selectedDay = day;
  ctx.editMessageText(`Выбран день: ${day}`);
  ctx.reply(
    `Введите новое время и текст для ${day} в формате "HH:MM, Текст сообщения":`,
  );
  ctx.answerCbQuery();
});
bot.action('cancel_action', cancelActionHandler);

bot.hears(/^\d{2}:\d{2},.*/, async (ctx) => {
  const text = ctx.message?.text ?? '';
  const [time, msg] = text.split(',').map((s) => s.trim());
  if (!time || !msg) {
    ctx.reply('Неверный формат. Используйте "HH:MM, Текст сообщения".');
    return;
  }

  const day = selectedDay; // Получаем день из callback
  if (!day) return;

  await updateSchedule(day, time, msg); // Обновляем расписание в базе данных
  ctx.reply(`Расписание для ${day} обновлено: Время: ${time}, Текст: "${msg}"`);
  const updatedSchedule = await getScheduleFromDatabase();
  scheduleDailyTasks(bot, updatedSchedule, GROUP_ID);
});

bot.action('close', (ctx) => {
  ctx.editMessageText('Редактор расписания закрыт.');
  selectedDay = null;
  ctx.answerCbQuery();
});

bot.on('message', handleNoteInput);

bot.launch();
