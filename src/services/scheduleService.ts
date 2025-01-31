import schedule from 'node-schedule';
import { Telegraf } from 'telegraf';
import { getDayOfWeek } from '../utils/scheduleUtils';
import type { ScheduleConfig } from '../types/scheduleConfig';

export const scheduleDailyTasks = (
  bot: Telegraf,
  scheduleConfig: ScheduleConfig,
  groupId: number | null,
) => {
  let dailyJobs: { [key: string]: schedule.Job } = {};
  let pollJobs: { [key: string]: schedule.Job } = {};

  const cancelJobs = () => {
    Object.keys(dailyJobs).forEach((day) => dailyJobs[day].cancel());
    Object.keys(pollJobs).forEach((day) => pollJobs[day].cancel());
    dailyJobs = {};
    pollJobs = {};
  };

  cancelJobs(); // Удаляем старые задачи

  // Идем по дням расписания
  Object.keys(scheduleConfig).forEach((day) => {
    const { time, text } = scheduleConfig[day as keyof ScheduleConfig]; // Получаем время и текст для каждого дня
    const [hour, minute] = time.split(':').map(Number);
    console.log(`Задача для ${day} установлена на ${hour}:${minute}`);

    // Задача для отправки опроса за 30 минут до начала дейлика
    let pollHour = hour;
    let pollMinute = minute - 30;
    if (pollMinute < 0) {
      pollHour -= 1;
      pollMinute += 60;
    }
    console.log(`Опрос для ${day} будет отправлен в ${pollHour}:${pollMinute}`);
    pollJobs[day] = schedule.scheduleJob(
      { hour: pollHour, minute: pollMinute, dayOfWeek: [getDayOfWeek(day)] },
      () => {
        console.log(`Отправка опроса для ${day} в ${pollHour}:${pollMinute}`);
        if (groupId) {
          bot.telegram
            .sendPoll(groupId, 'Кто идет на дейлик?', ['Иду', 'Не иду'])
            .then(() => {
              console.log('Опрос отправлен успешно!');
            })
            .catch((error) => {
              console.log('Ошибка при отправке опроса:', error);
            });
        } else {
          console.log('groupId не установлен');
        }
      },
    );

    // Задача для отправки сообщения о начале дейлика
    dailyJobs[day] = schedule.scheduleJob(
      { hour, minute, dayOfWeek: [getDayOfWeek(day)] },
      () => {
        console.log(`Задача для ${day} сработала!`);
        if (groupId) {
          bot.telegram
            .sendMessage(groupId, text)
            .then(() => {
              console.log('Сообщение отправлено успешно!');
            })
            .catch((error) => {
              console.log('Ошибка при отправке сообщения:', error);
            });
        } else {
          console.log('groupId не установлен');
        }
      },
    );
  });
};
