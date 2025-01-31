import { Schedule } from '../database'; // Импортируем модель Schedule
import type { ScheduleConfig } from '../types/scheduleConfig';

const defaultSchedule: ScheduleConfig = {
  Пн: { time: '10:30', text: 'Начало дейлика!' },
  Вт: { time: '10:30', text: 'Начало дейлика!' },
  Ср: { time: '11:00', text: 'Начало дейлика!' },
  Чт: { time: '10:30', text: 'Начало дейлика!' },
  Пт: { time: '10:30', text: 'Начало дейлика!' },
};

export const initializeDefaultSchedule = async () => {
  const days: ('Пн' | 'Вт' | 'Ср' | 'Чт' | 'Пт')[] = [
    'Пн',
    'Вт',
    'Ср',
    'Чт',
    'Пт',
  ];

  for (const day of days) {
    const existingSchedule = await Schedule.findOne({ where: { day } });
    if (!existingSchedule) {
      // Если расписания для этого дня нет, создаем его с дефолтными значениями
      await Schedule.create({
        day,
        time: defaultSchedule[day].time,
        text: defaultSchedule[day].text,
      });
      console.log(`Дефолтное расписание для ${day} добавлено.`);
    }
  }
};
// Обновляем расписание в базе данных
export const updateSchedule = async (
  day: string,
  time: string,
  text: string,
): Promise<void> => {
  try {
    const schedule = await Schedule.findOne({ where: { day } });
    if (schedule) {
      // Если запись существует, обновляем
      schedule.time = time;
      schedule.text = text;
      await schedule.save();
    } else {
      // Если записи нет, создаем новую
      await Schedule.create({ day, time, text });
    }
  } catch (error) {
    console.error('Ошибка при обновлении расписания:', error);
  }
};

// Функция для получения актуального расписания из базы данных
export const getScheduleFromDatabase = async (): Promise<ScheduleConfig> => {
  // Получаем все расписания для дней недели
  const allSchedules = await Schedule.findAll();

  const updatedSchedule: ScheduleConfig = {
    Пн: { time: '', text: '' },
    Вт: { time: '', text: '' },
    Ср: { time: '', text: '' },
    Чт: { time: '', text: '' },
    Пт: { time: '', text: '' },
  };

  // Присваиваем значения для каждого дня из базы данных
  allSchedules.forEach((schedule) => {
    updatedSchedule[schedule.day as 'Пн' | 'Вт' | 'Ср' | 'Чт' | 'Пт'] = {
      time: schedule.time,
      text: schedule.text,
    };
  });

  return updatedSchedule;
};

// Функция для преобразования дня недели в число
export function getDayOfWeek(day: string): number {
  const daysOfWeek: { [key: string]: number } = {
    Вс: 0,
    Пн: 1,
    Вт: 2,
    Ср: 3,
    Чт: 4,
    Пт: 5,
    Сб: 6,
  };
  return daysOfWeek[day];
}
