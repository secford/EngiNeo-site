const http = require('http');
const { sendResponse } = require('./helpers');
const fs = require('fs');

const server = http.createServer((request, response) => {
  const url = request.url;

  if (url === '/') {
    fs.readFile('../index.html', 'utf8', (err, data) => {
      if (err) {
        response.writeHead(500);
        response.end('Ошибка чтения файла');
        return;
      }
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(data);
    });
  } else if (url === '/about') {
    sendResponse(response, 200, '<h1>О нас</h1><p>Мы учим Node.js!</p>');
  } else if (url === '/contact') {
    sendResponse(response, 200, '<h1>Контакты</h1><p>Email: test@test.com</p>');
  } else {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('404 — страница не найдена');
  }
});

server.listen(5000, () => {
  console.log('Сервер работает на http://localhost:5000');
});