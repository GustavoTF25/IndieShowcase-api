const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');
const fs = require('fs');

// let uploads = "./postagens/";
// if (!fs.existsSync(uploads)){ fs.mkdirSync(uploads); }
// const storage = multer.diskStorage({
//     destination: function (req, file, cb){
//         cb(null, './postagens/');
//     },
//     filename: function (req, file, cb){
//         cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname);
//     }
// });
// const fileFilter = (req, file, cb) => {
//     if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' ||
//      file.mimetype == 'image/gif' || file.mimetype == 'application/zip' 
//      || file.mimetype == 'audio/mpeg' || file.mimetype == 'video/mp4' ){ 
//     cb(null, true);
//     }else{
//     cb(null, false);
//     }
// }
// const upload = multer({storage: storage, limits: { fileSize: 1024 * 1024 * 1024 * 1}, fileFilter: fileFilter});
const authlogin = require('../middleware/authlogin');
const postController = require('../controllers/postController')

//Rotas 
router.get('/', postController.getposts);
router.get ('/procurar/:titulo', postController.getpoststitulo);
router.post('/publicar' /*, upload.single('arquivo') */, authlogin.opcional,  postController.postpostagem);

module.exports = router;