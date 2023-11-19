const express = require('express');
const router = express.Router();

const authlogin = require('../middleware/authlogin');
const postController = require('../controllers/postController')

//Rotas 
router.get('/', postController.getallposts);
router.get ('/procurar/:titulo', postController.getpoststitulo);
router.get('/:pos_id', postController.getpostsid);
router.post('/publicar', authlogin.opcional, postController.postpostagem);
router.post('/comentar/:pos_id', authlogin.opcional, postController.postComentario);

module.exports = router;