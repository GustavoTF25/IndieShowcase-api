const express = require('express');
const router = express.Router();
const decodetoken = require('../middleware/decodetoken');
const postController = require('../controllers/postController')
const fileUpload = require('express-fileupload');

/*Rotas de postagens*/
router.use(
    fileUpload({
      limits: { fileSize: 8 * 1024 * 1024 * 1024, // 8 GB
               abortOnLimit: true,
      },
    })
  );

//Pega todas as postagens 
router.get('/', postController.getallposts);
//pega postagens do usuairo
router.get('/detalhe/:usu_id', postController.getusuariopostagens);
//Busca postagem com base em seu título
router.get('/procurar/:titulo', postController.getpoststitulo);

//Busca as postagens cadastradas por id
router.get('/:pos_id', postController.getpostsid);

//publicar postagem
router.post('/publicar', decodetoken.decodifica, postController.postpostagem);

//Lista as postagens por categoria
router.get('/listar/:cat_id', postController.getcategoriaspost)
router.get('/listarNome/:cat_nome', postController.getcategoriasnomepost)


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
router.patch('/editar-post/:pos_id', postController.patchpostagem);

//Download do arquivo da Postagem
router.get('/baixar/:pos_id', postController.download);

//Pega o arquivo de uma postagem por id
router.get('/arquivos/:pos_id', postController.getarquivo);


module.exports = router;