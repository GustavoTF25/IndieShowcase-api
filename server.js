const http = require('http');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();
//const ipe = require("ip");
//const os = require("node:os")
// Configuração do servidor HTTP
const port = process.env.PORT || 8001;


const server1 = http.createServer(app);
const ip1 = '192.168.1.3'
server1.listen(port, ip1 ,() => {
        console.log(`Servidor rodando na porta ${ip1}:${port} no processo ${process.pid}`);
});

//const server2 = http.createServer(app);
//const ip2 = '26.144.73.80'
//server2.listen(port, ip2 ,() => {
//        console.log(`Servidor rodando na porta ${ip2}:${port} no processo ${process.pid}`);
//});


//console.log(os.networkInterfaces())
//console.dir ( ipe.address() );

// Inicia o servidor
// server.listen(port, () => {
//    console.log(`Servidor rodando na porta ${port} no processo ${process.pid}`);
// });