import { Sequelize, Model, DataTypes } from 'sequelize';

// Создаем подключение к базе данных
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Путь к базе данных
});
// Определяем модель для заметок
class Note extends Model {
  public id!: number;
  public name!: string;
  public text!: string;
}
// Определяем модель для расписания
class Schedule extends Model {
  public id!: number;
  public day!: string; // день недели (Пн, Вт, Ср и т.д.)
  public time!: string; // время расписания (например, 10:30)
  public text!: string; // текст сообщения
}
Schedule.init(
  {
    day: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // гарантируем уникальность дня
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Schedule',
  },
);

Note.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Note',
  },
);

// Синхронизируем базу данных (создадим таблицы)
sequelize.sync().then(() => console.log('База данных зарегистрирована'));

export { Schedule, Note, sequelize };
