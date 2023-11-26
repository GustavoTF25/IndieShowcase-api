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

//Lista todos os comentários
router.get('/comentar/todos', postController.getComentarios);

//comentar em alguma postagem
router.post('/comentar/:pos_id', authlogin.opcional, postController.postComentario);

router.post('/gostei', postController.postGostei);


module.exports = router;