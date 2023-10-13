const express = require('express');
const app = express()
const rotaUsuarios = require('./routes/usuarios');

app.use('/usuarios', rotaUsuarios);
app.use('/teste', (req, res, next) => {
res.status(200).send({mensagem: 'tudo funcionando'});
});

module.exports = app;