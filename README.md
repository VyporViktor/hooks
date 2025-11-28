# TradingView Webhooks Receiver

Приложение на Node.js для получения и отображения webhook-уведомлений от TradingView.

## Установка

```bash
npm install
```

## Запуск

**Важно:** Для запуска на порту 80 требуется права администратора (sudo на Linux/Mac).

```bash
sudo npm start
```

Или на обычном порту (например, 3000):
```bash
PORT=3000 node server.js
```

## Использование

1. Запустите сервер
2. Откройте в браузере: `http://localhost/` (или `http://localhost:3000/` если используете другой порт)
3. Отправляйте webhook-запросы на: `http://localhost/webhook` (POST запрос с JSON телом)

## Структура

- `server.js` - основной серверный файл
- `index.html` - главная страница с таблицей результатов
- `webhooks_data.json` - файл для хранения полученных webhooks (создается автоматически)

## Пример webhook запроса

```bash
curl -X POST http://localhost/webhook \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSD","price":50000,"action":"buy"}'
```

## Особенности

- Автоматическое сохранение всех полученных webhooks в JSON файл
- Веб-интерфейс с таблицей всех полученных данных
- Автообновление данных каждые 5 секунд (опционально)
- Отображение статистики (количество webhooks, время последнего обновления)

