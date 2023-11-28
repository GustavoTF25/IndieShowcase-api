const cluster = require('cluster');
const http = require('http');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();

if (cluster.isMaster) {
    // Este bloco é executado apenas no processo mestre

    // Obtém o número de núcleos na CPU
    const numCPUs = require('os').cpus().length;

    // Cria processos filhos igual ao número de núcleos
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Evento que é acionado quando um processo filho morre
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} morreu`);
        // Reinicia o processo filho que morreu
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
