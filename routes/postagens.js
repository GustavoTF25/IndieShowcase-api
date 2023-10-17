const express = require('express');
const router = express.Router();
const mysql= require('../mysql').pool;


//raw query de todas as postagens
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


//CRIA UM NOVO USUARIO NO BANCO
router.post('/', (req, res, next) => {
    const postagem = {
       pos_id: req.body.pos_id,
       nome: req.body.nome,
       descricao: req.body.descricao
    }
    res.status(201).send({
        mensagem: 'usando o post na rota de postagem',
        postagemCriado: postagem
    });
});

//Insercao de postagem
 //codigo baseado no de usuarios
router.post('/publicar', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})}
         // se ja houver uma postagem
        conn.query('SELECT * FROM pos_postagem WHERE pos_id = ?', [req.body.pos_id], (error,results) => {
            if(error){return res.status(500).send({error: error})}
            if(results.length > 0) {
                res.status(409).send({mensagem: 'Postagem jÃ¡ criada anteriormente'});
            }else{
                if(error){return res.status(500).send({error: mysql})}
                conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao,pos_tags,usu_id, cat_id) VALUES (?,?,?,?,?)', [req.body.pos_nome, req.body.pos_descricao, req.body.pos_tags,req.body.usu_id,req.body.cat_id], 
                (error,results) => {
                    conn.release();
                    if(error) {return res.status(500).send({error:error})}
                    response = {
                        mensagem: "Postagem criada!",
                        postagemcriada: {
                            pos_id : results.insertId,
                            pos_nome: req.body.pos_nome,
                            pos_descricao: req.body.pos_descricao,
                            pos_tags: req.body.pos_tags,
                            usu_id: req.body.usu_id,
                            cat_id: req.body.cat_id
                        }
                    }
                    return res.status(201).send(response);
                });
                
            }
        });
    
    });
});




module.exports = router;
