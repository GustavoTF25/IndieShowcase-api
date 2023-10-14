const express = require('express');
const router = express.Router();


router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'usando o get na rota de usuarios'
    });
});


//CRIA UM NOVO USUARIO NO BANCO
router.post('/', (req, res, next) => {
    const postagem = {
       pos_id: req.body.pos_id,
       nome: req.body.nome,
       descricao: req.body.descricao
    }
    res.status(201).send({
        mensagem: 'usando o post na rota de usuarios',
        postagemCriado: postagem
    });
});

module.exports = router;