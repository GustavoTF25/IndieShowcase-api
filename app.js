const express = require('express');
const app = express()
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const rotaUsuarios = require('./routes/usuarios');
const rotaPostagens = require('./routes/postagens');
const rotaCategorias = require('./routes/categorias');

app.use(morgan('dev'));
app.use('/postagens/uploads' ,express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false})); // apenas dados simples
app.use(bodyParser.json());
app.use(cors());

app.use('/usuarios', rotaUsuarios);
app.use('/postagens', rotaPostagens);
app.use('/categorias', rotaCategorias);


//rota não encontrada
app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);

});

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    return res.send({
        erro: {
            mensagem: error.message
        }
    })
});

app.use('/teste', (req, res, next) => {
res.status(200).send({mensagem: 'tudo funcionando'});
});

module.exports = app;
