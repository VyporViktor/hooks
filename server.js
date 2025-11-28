const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 80;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'webhooks_data.json');

// Middleware для парсинга JSON
app.use(express.json());

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
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
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
  const data = readData();
  res.json(data);
});

// Блокируем доступ к директории data
app.use('/data', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// Статические файлы - только конкретные файлы, не вся директория
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
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

