const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');
const fs = require('fs');

const authlogin = require('../middleware/authlogin');
const postController = require('../controllers/postController')

//Rotas 
router.get('/', postController.getposts);
router.get ('/procurar/:titulo', postController.getpoststitulo);
router.post('/publicar'  , authlogin.opcional,  postController.postpostagem);

module.exports = router;