const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads/');
    },
    filename: function (req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' ||
     file.mimetype == 'image/gif' || file.mimetype == 'application/zip' 
     || file.mimetype == 'audio/mpeg' || file.mimetype == 'video/mp4' ){ 
    cb(null, true);
    }else{
    cb(null, false);
    }
}
const upload = multer({storage: storage, limits: { fileSize: 1024 * 1024 * 1024 * 1}, fileFilter: fileFilter});
const authlogin = require('../middleware/authlogin');


//Get de todas as postagens
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => { 
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        'SELECT * FROM pos_postagem',
        (error, resultado, fields) => {
            if(error) { return res.status(500).send({error: error})}
            return res.status(200).send({response: resultado});
        }
      );
    });
});


//Insercao de postagem
//codigo baseado no de usuarios
router.post('/publicar', authlogin.opcional, upload.single('arquivo'), (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})}
                if(error){return res.status(500).send({error: mysql})}
                conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) VALUES (?,?,?,?,?)', 
                [req.body.titulo, req.body.descricao, req.body.tags, req.user.usu_id, req.body.cat_id, req.file.path], 
                (error,results) => {
                    conn.release();
                    if(error) {return res.status(500).send({error:error})}
                    response = {
                        mensagem: "Postagem criada!",
                        postagemcriada: {
                            pos_id : results.insertId,
                            titulo: req.body.titulo,
                            descricao: req.body.descricao,
                            tags: req.body.pos_tags,  
                            usu_id: req.user.usu_id, 
                            cat_id: req.body.cat_id,
                            arquivo : req.file.path    
                            
                        }
                    }
                    return res.status(201).send(response);
                });
                
            });
        });

module.exports = router;