const express = require('express');
const app = express()
const morgan = require('morgan');
const cors = require('cors');
const rotaUsuarios = require('./routes/usuarios');
const rotaPostagens = require('./routes/postagens');
const rotaCategorias = require('./routes/categorias');
const fileUpload = require('express-fileupload');


app.use(morgan('dev'));
//app.use('/postagens/uploads', express.static('uploads'))
app.use('/postagens', express.static('postagens'));
app.use(express.json());
app.use(cors());
app.use(
    fileUpload({
        limits: { fileSize: 24 * 1024 * 1024 /* mais ou memnos 50MB */},
        abortOnLimit: true,
    })
);


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
