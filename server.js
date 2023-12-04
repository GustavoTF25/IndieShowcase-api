const http = require('http');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();

// Configuração do servidor HTTP
const port = process.env.PORT || 8000;
const server = http.createServer(app);
//server.maxConnections = 15000;

// Inicia o servidor
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port} no processo ${process.pid}`);
});
