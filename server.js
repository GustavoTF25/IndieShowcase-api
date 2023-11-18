const http = require('http');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();
const port = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(port);

