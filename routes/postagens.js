const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');
const upload = multer({dest: '/uploads/' });
//const authmiddleware = require('../middleware/authmiddleware');
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
router.post('/publicar', authlogin.opcional, (req, res, next) => {
    console.log(req.user.usu_id)
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})}
                if(error){return res.status(500).send({error: mysql})}
                conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) VALUES (?,?,?,?,?)', 
                [req.body.titulo, req.body.descricao, req.body.tags, req.user.usu_id, req.body.cat_id], 
                (error,results) => {
                    conn.release();
                    if(error) {return res.status(500).send({error:error})}
                    response = {
                        mensagem: "Postagem criada!",
                        postagemcriada: {
                            pos_id : results.insertId,
                            titulo: req.body.pos_nome,
                            descricao: req.body.pos_descricao,
                            tags: req.body.pos_tags,  
                            usu_id: req.user.usu_id, 
                            cat_id: req.body.cat_id,    
                            
                        }
                    }
                    return res.status(201).send(response);
                });
                
            });
        });

module.exports = router;