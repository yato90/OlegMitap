import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { Schedule } from '../../database'; // Импортируем модель Schedule
import { callbackQuery } from 'telegraf/filters';

// Получаем расписание из базы данных
export const getScheduleCommand = async (ctx: Context) => {
  try {
    const schedules = await Schedule.findAll();
    if (schedules.length === 0) {
      return ctx.reply('Нет доступного расписания.');
    }

    let scheduleString = 'Актуальное расписание:\n';
    schedules.forEach((schedule) => {
      scheduleString += `${schedule.day}: ${schedule.time} - ${schedule.text}\n`;
    });

    ctx.reply(scheduleString);
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    ctx.reply('Произошла ошибка при получении расписания.');
  }
};

// Устанавливаем новое расписание
export const setScheduleCommand = async (ctx: Context) => {
  ctx.reply(
    'Выберите день:',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('Понедельник', 'Пн'),
        Markup.button.callback('Вторник', 'Вт'),
      ],
      [
        Markup.button.callback('Среда', 'Ср'),
        Markup.button.callback('Четверг', 'Чт'),
      ],
      [
        Markup.button.callback('Пятница', 'Пт'),
        Markup.button.callback('Закрыть', 'close'),
      ],
    ]),
  );
};

// Обработчик для изменения расписания
export const updateScheduleCommand = async (ctx: Context) => {
  if (!ctx.has(callbackQuery('data'))) {
    return;
  }
  const selectedDay = ctx.callbackQuery?.data;
  if (!selectedDay) return;

  ctx.editMessageText(`Выбран день: ${selectedDay}`);
  ctx.reply(
    `Введите новое время и текст для ${selectedDay} в формате "HH:MM, Текст сообщения":`,
  );
};
