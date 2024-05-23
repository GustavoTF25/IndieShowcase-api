const http = require('http');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();

// Configuração do servidor HTTP
const port = process.env.PORT || 8001;
const server = http.createServer(app);

// Inicia o servidor
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port} no processo ${process.pid}`);
});
//const ip = '192.168.1.9'
//server.listen(port, ip ,() => {
//        console.log(`Servidor rodando na porta ${ip}:${port} no processo ${process.pid}`);
//});
