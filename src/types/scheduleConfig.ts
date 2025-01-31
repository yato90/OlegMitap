export interface ISchedule {
  days: string[];
  times: Record<string, string>;
  texts: Record<string, string>;
}
export type ScheduleConfig = {
  [day in 'Пн' | 'Вт' | 'Ср' | 'Чт' | 'Пт']: {
    time: string;
    text: string;
  };
};
