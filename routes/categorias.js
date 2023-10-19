const express = require('express');
const router = express.Router();
const mysql= require('../mysql').pool;
require('dotenv').config();
 

 router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => { 
        if(error) {return res.status(500).send({error:error})};
        conn.query('SELECT * FROM cat_categorias');
        return res;
    });
  
});

router.post('/', (req, res, next) => {
    const categoria= {
       cat_id: req.body.cat_id,
       nome: req.body.nome,
       }
    res.status(201).send({
        mensagem: 'usando o post na rota de categorias',
        categoriaCriado:categoria
    });
});

// router.post('/adicionar', (req, res, next) => {
//     mysql.getConnection((error, conn) => {
//         if(error) {return res.status(500).send({error:error})}
// if(error){return res.status(500).send({error: mysql})}
// conn.query('INSERT INTO cat_categoria ( cat_nome) VALUES (?)', 
//                 [req.body.nome], (error,results) => {
//                     conn.release();
//                     if(error) {return res.status(500).send({error:error})}
//                     response = {
//                         mensagem: "Categoria adicionada.",
//                         categoriaCriado: {
//                             cat_id: results.insertId,
//                             nome: req.body.nome
//                         }
//                     }
//                     return res.status(201).send(response);
//                 });
                
//             });
//         });
router.post('/adicionar', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})}
         // se ja houver uma categoria
        conn.query('SELECT * FROM cat_categoria WHERE cat_id = ?', [req.body.cat_id], (error,results) => {
            if(error){return res.status(500).send({error: error})}
            if(results.length > 0) {
                res.status(409).send({mensagem: 'Categoria ja criada anteriormente'});
            }else{
                if(error){return res.status(500).send({error: mysql})}
                conn.query('INSERT INTO cat_categoria ( cat_nome) VALUES (   ?)',
                 [req.body.nome],
                 (error,results) => { 
                    conn.release();
                    if(error) {return res.status(500).send({error:error})}
                    response = {
                        mensagem: "Categoria criada!",
                        categoriaCriado: {
                            cat_id : results.insertId,
                            nome: req.body.nome,
                        
                        }
                    }
                    return res.status(201).send(response);
                });
                //console.log(results.insertId , req.body.nome);
            }
        });
    
    });
});


module.exports = router;