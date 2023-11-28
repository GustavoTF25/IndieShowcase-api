const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const authlogin = require('../middleware/authlogin');
const postController = require('../controllers/postController')

router.use(
    fileUpload({
        limits: { fileSize: 24 * 1024 * 1024 * 1024 /* mais ou memnos 2GB */},
        abortOnLimit: true,
    })
);

//Rotas 
router.get('/', postController.getallposts);
router.get ('/procurar/:titulo', postController.getpoststitulo);
router.get('/:pos_id', postController.getpostsid);
router.post('/publicar', authlogin.opcional, postController.postpostagem);
router.post('/comentar/:pos_id', authlogin.opcional, postController.postComentario);
router.get('/listar/:cat_id', postController.getcategoriaspost);
router.post('/gostei/:pos_id', authlogin.opcional, postController.postGostei);
router.delete('/apagar-usu-post/:pos_id', authlogin.opcional, postController.delPostagem); // vo deixa issaqui pro adm
router.delete('/remover/:pos_id', authlogin.opcional, postController.delPostagemUser); //esse é do usuario

module.exports = router;