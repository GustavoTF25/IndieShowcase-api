const express = require('express');
const router = express.Router();
const decodetoken = require('../middleware/decodetoken');
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
router.post('/publicar', decodetoken.decodifica, postController.postpostagem);

//Lista as postagens por categoria
router.get('/listar/:cat_id', decodetoken.decodifica, postController.getcategoriaspost)

//Lista todos os comentários
router.get('/comentar/todos', postController.getComentarios);

//Lista os comentários de uma determinada postagem
router.get('/comentarios/:pos_id', postController.getComentariospost);

//comentar em alguma postagem
router.post('/comentar/:pos_id', decodetoken.decodifica, postController.postComentario);

//curte uma postagem
router.post('/gostei/:pos_id', decodetoken.decodifica, postController.postGostei);

//Apagar Postagem
router.delete('/apagar-post/:pos_id', postController.delPostagem);

//apagar postagem do usuário
//router.delete('/remover/:pos_id', decodetoken.decodifica, postController.delPostagemUser); 

router.patch('/editar-post/:pos_id', postController.patchpostagem);


module.exports = router;