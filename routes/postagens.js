const express = require('express');
const router = express.Router();
const authlogin = require('../middleware/authlogin');
const postController = require('../controllers/postController')
const fileUpload = require('express-fileupload');

/*Rotas de postagens*/
router.use(
    fileUpload({
        limits: { fileSize: 24 * 1024 * 1024 * 1024 /* mais ou memnos 26MB */},
        abortOnLimit: true,
    })
);


//Pega todas as postagens 
router.get('/', postController.getallposts);

//Busca postagem com base em seu título
router.get ('/procurar/:titulo', postController.getpoststitulo);

//Busca as postagens cadastradas por id
router.get('/:pos_id', postController.getpostsid);

//publicar postagem
router.post('/publicar', authlogin.opcional, postController.postpostagem);

//Lista as postagens por categoria
router.get('/listar/:cat_id', postController.getcategoriaspost)

//Lista todos os comentários
router.get('/comentar/todos', postController.getComentarios);

//Lista os comentários de uma determinada postagem
router.get('/comentarios/:pos_id', postController.getComentariospost);

//comentar em alguma postagem
router.post('/comentar/:pos_id', authlogin.opcional, postController.postComentario);

router.post('/gostei/:pos_id', authlogin.opcional, postController.postGostei);


module.exports = router;