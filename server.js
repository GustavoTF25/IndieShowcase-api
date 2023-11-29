const cluster = require('cluster');
const http = require('http');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();

if (cluster.isMaster) {

    const numCPUs = require('os').cpus().length;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} morreu`);
        cluster.fork();
    });
} else {
    // Configuração do servidor HTTP
    const port = process.env.PORT || 8000;
    const server = http.createServer(app);
    //server.maxConnections = 15000;

    // Inicia o servidor
    server.listen(port, () => {
        console.log(`Servidor rodando na porta ${port} no processo ${process.pid}`);
    });
}
