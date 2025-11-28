const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 80;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'webhooks_data.json');

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Создаем директорию для данных, если её нет
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Инициализация файла данных, если его нет
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Функция для чтения данных из файла
function readData() {
  try {
    // Проверяем существование файла
    if (!fs.existsSync(DATA_FILE)) {
      console.warn('Файл данных не найден, создаем новый');
      // Создаем директорию, если её нет
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      // Создаем пустой файл
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    
    // Проверяем, что файл не пустой
    if (!fileContent || fileContent.trim() === '') {
      console.warn('Файл данных пуст, возвращаем пустой массив');
      return [];
    }
    
    const data = JSON.parse(fileContent);
    
    // Проверяем, что данные - это массив
    if (!Array.isArray(data)) {
      console.error('Данные в файле не являются массивом, возвращаем пустой массив');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
    // При ошибке парсинга JSON, возвращаем пустой массив, но логируем ошибку
    if (error instanceof SyntaxError) {
      console.error('Ошибка парсинга JSON. Файл может быть поврежден.');
    }
    return [];
  }
}

// Функция для сохранения данных в файл
function saveData(dataArray) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataArray, null, 2));
  } catch (error) {
    console.error('Ошибка при сохранении файла:', error);
  }
}

// Webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('Получен webhook:', JSON.stringify(req.body, null, 2));
  
  const webhookData = {
    timestamp: new Date().toISOString(),
    data: req.body
  };
  
  // Читаем существующие данные
  const allData = readData();
  
  // Добавляем новый webhook
  allData.push(webhookData);
  
  // Сохраняем обратно в файл
  saveData(allData);
  
  res.status(200).json({ 
    success: true, 
    message: 'Webhook получен и сохранен',
    timestamp: webhookData.timestamp
  });
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint для получения данных
app.get('/api/data', (req, res) => {
  try {
    console.log(`Запрос данных: проверка файла ${DATA_FILE}`);
    console.log(`Директория существует: ${fs.existsSync(DATA_DIR)}`);
    console.log(`Файл существует: ${fs.existsSync(DATA_FILE)}`);
    
    const data = readData();
    console.log(`Данные успешно загружены, количество записей: ${data.length}`);
    res.json(data);
  } catch (error) {
    console.error('Ошибка при получении данных через API:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Ошибка при загрузке данных',
      message: error.message 
    });
  }
});

// Блокируем доступ к директории data (но не к /api/data)
app.get('/data*', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// Статические файлы - только конкретные файлы, не вся директория
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// Обработка ошибок 404
app.use((req, res) => {
  console.warn(`404 - Страница не найдена: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Обработка всех необработанных ошибок
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Webhook URL: http://localhost/webhook`);
  console.log(`Главная страница: http://localhost/`);
}).on('error', (err) => {
  if (err.code === 'EACCES') {
    console.error(`Ошибка: требуется права администратора для запуска на порту ${PORT}`);
    console.error('Запустите: sudo npm start');
    console.error('Или измените PORT в коде на другой порт (например, 3000)');
  } else {
    console.error('Ошибка при запуске сервера:', err);
  }
  process.exit(1);
});

