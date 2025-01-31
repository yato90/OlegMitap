import { Context, Markup } from 'telegraf';
import { Note } from '../../database';

// Хранилище для временного состояния
const userStates: { [userId: string]: { action: string; noteName?: string } } =
  {};

// Команда для добавления заметки
export const addNoteCommand = (ctx: Context) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;

  userStates[userId] = { action: 'add' };
  ctx.reply(
    'Введите название новой заметки:',
    Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel_action')]),
  );
};

// Команда для редактирования заметки
export const editNoteCommand = (ctx: Context) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;

  userStates[userId] = { action: 'edit' };
  ctx.reply(
    'Введите название заметки, которую хотите отредактировать:',
    Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel_action')]),
  );
};

// Команда для удаления заметки
export const deleteNoteCommand = (ctx: Context) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;

  userStates[userId] = { action: 'delete' };
  ctx.reply(
    'Введите название заметки, которую хотите удалить:',
    Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel_action')]),
  );
};
export const getNoteCommand = (ctx: Context) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;

  userStates[userId] = { action: 'get' };
  ctx.reply(
    'Введите название заметки, которую хотите получить:',
    Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel_action')]),
  );
};

// Обработка ввода пользователя
export const handleNoteInput = async (ctx: Context) => {
  const userId = ctx.from?.id.toString();
  if (!userId || !ctx.message || !('text' in ctx.message)) return;

  const state = userStates[userId];
  const userText = ctx.message.text;

  if (!state) return;

  switch (state.action) {
    case 'add': {
      if (!state.noteName) {
        // Первый шаг: ввод названия заметки
        state.noteName = userText;
        ctx.reply('Введите текст для новой заметки:');
      } else {
        // Второй шаг: ввод текста заметки
        try {
          const existingNote = await Note.findOne({
            where: { name: state.noteName },
          });
          if (existingNote) {
            ctx.reply(
              `Заметка с названием "${state.noteName}" уже существует.`,
            );
          } else {
            await Note.create({ name: state.noteName, text: userText });
            ctx.reply(`Заметка "${state.noteName}" успешно добавлена.`);
          }
        } catch (error) {
          console.error('Ошибка при добавлении заметки:', error);
          ctx.reply('Произошла ошибка при добавлении заметки.');
        }
        delete userStates[userId];
      }
      break;
    }
    case 'edit': {
      if (!state.noteName) {
        // Первый шаг: ввод названия заметки для редактирования
        state.noteName = userText;
        ctx.reply('Введите новый текст для заметки:');
      } else {
        // Второй шаг: ввод нового текста
        try {
          const note = await Note.findOne({ where: { name: state.noteName } });
          if (!note) {
            ctx.reply(`Заметка с названием "${state.noteName}" не найдена.`);
          } else {
            note.text = userText;
            await note.save();
            ctx.reply(`Заметка "${state.noteName}" успешно отредактирована.`);
          }
        } catch (error) {
          console.error('Ошибка при редактировании заметки:', error);
          ctx.reply('Произошла ошибка при редактировании заметки.');
        }
        delete userStates[userId];
      }
      break;
    }
    case 'delete': {
      try {
        const note = await Note.findOne({ where: { name: userText } });
        if (!note) {
          ctx.reply(`Заметка с названием "${userText}" не найдена.`);
        } else {
          await note.destroy();
          ctx.reply(`Заметка "${userText}" успешно удалена.`);
        }
      } catch (error) {
        console.error('Ошибка при удалении заметки:', error);
        ctx.reply('Произошла ошибка при удалении заметки.');
      }
      delete userStates[userId];
      break;
    }
    case 'get': {
      try {
        const note = await Note.findOne({ where: { name: userText } });
        if (!note) {
          ctx.reply(`Заметка с названием "${userText}" не найдена.`);
        } else {
          ctx.reply(`Заметка "${note.name}":\n${note.text}`);
        }
      } catch (error) {
        console.error('Ошибка при получении заметки:', error);
        ctx.reply('Произошла ошибка при получении заметки.');
      }
      delete userStates[userId];
      break;
    }
    default:
      delete userStates[userId];
      ctx.reply('Произошла ошибка. Попробуйте снова.');
  }
};
// Обработчик отмены действия
export const cancelActionHandler = (ctx: Context) => {
  const userId = ctx.from?.id.toString();
  if (userId) {
    delete userStates[userId];
    ctx.editMessageText('Действие отменено.');
  }
};
// Команда для получения всех заметок (ID и Название)
export const getAllNotesCommand = async (ctx: Context) => {
  try {
    // Получаем все заметки из базы данных
    const notes = await Note.findAll({
      attributes: ['id', 'name'], // Только ID и название
    });

    if (notes.length === 0) {
      return ctx.reply('Нет заметок в базе данных.');
    }

    // Формируем ответ
    let notesList = 'Список всех заметок:\n';
    notes.forEach((note) => {
      notesList += `ID: ${note.id}, Название: ${note.name}\n`;
    });

    ctx.reply(notesList);
  } catch (error) {
    console.error('Ошибка при получении заметок:', error);
    ctx.reply('Произошла ошибка при получении заметок.');
  }
};
