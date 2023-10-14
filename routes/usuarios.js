const express = require('express');
const router = express.Router();

//PEGA TODOS OS USUARIOS
router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'usando o get na rota de usuarios'
    });
});


//CRIA UM NOVO USUARIO NO BANCO
router.post('/', (req, res, next) => {
    const usuario ={
       nome: req.body.nome,
       email: req.body.email
    }
    res.status(201).send({
        mensagem: 'usando o post na rota de usuarios',
        userCriado: usuario
    });
});

//SELECIONA UM USUARIO POR SEU ID
router.get('/:id_usuario',(req, res, next) => {

    })

//Exclui um usuario
    router.delete('/', (req, res, next) => {
        res.status(201).send({
            mensagem: 'usando o post na rota de usuarios'
        });
    });
    
module.exports = router;