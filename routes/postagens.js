const express = require('express');
const router = express.Router();
const authlogin = require('../middleware/authlogin');
const postController = require('../controllers/postController')

/*Rotas de postagens*/


//Pega todas as postagens 
router.get('/', postController.getallposts);

//Busca postagem com base em seu título
router.get ('/procurar/:titulo', postController.getpoststitulo);

//Busca as postagens cadastradas por id
router.get('/:pos_id', postController.getpostsid);

//publicar postagem
router.post('/publicar', authlogin.opcional, postController.postpostagem);

//Lista todos os comentários
router.get('/comentar/todos', postController.getComentarios);

//comentar em alguma postagem
router.post('/comentar/:pos_id', authlogin.opcional, postController.postComentario);

module.exports = router;