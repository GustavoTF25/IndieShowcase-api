const mysql = require('../mysql').pool;

exports.getcategorias = (req, res, next) => {
    mysql.getConnection((error, conn) => { 
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        'SELECT * FROM cat_categoria',
        (error, resultado, fields) => {
            if(error) { return res.status(500).send({error: error})}
            return res.status(200).send({response: resultado});
        }
      );
    });
  
};

exports.postcategorias = (req, res, next) => {
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
};