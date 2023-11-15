const mysql = require('../mysql').pool;
const fs = require('fs');

const uploads = "./postagens/";
if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads);
}


exports.getallposts = (req, res, next) => {
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
};

exports.getpoststitulo = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        `Select * FROM pos_postagem where pos_nome LIKE '%${req.params.titulo}%'`,
        (error, resultado, fields) => {
        if(error) {return res.status(500).send({error:error})};
        return res.status(200).send({response: resultado});
    }
    );
});
}

exports.getpostsid = (req, res) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        `Select * FROM pos_postagem where pos_id = ?`,
        [req.params.pos_id],
        (error, resultado, fields) => {
        if(error) {return res.status(500).send({error:error})};
        return res.status(200).send({response: resultado});
    }
    );
});
}

exports.postpostagem = (req, res, next)  => 
{   mysql.getConnection((error, conn) => 
    {  
        if(error) {return res.status(501).send({error:error, mensagem:"Conexão com banco falhou"})}
        let usuarioId = req.user.usu_id;
        let {arquivo} = req.files;
        conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id, pos_arquivo) VALUES (?,?,?,?,?,?)', 
        [req.body.titulo, req.body.descricao, req.body.tags, usuarioId, req.body.cat_id, req.files.path], 
        (error,results) => {
            conn.release();
            let postagemId = results.insertId;
            if(arquivo){
            let caminhoArquivo = `postagens/${postagemId}/  ` + arquivo.name;
            if(!fs.existsSync(`postagens/${postagemId}/`)){fs.mkdirSync(`postagens/${postagemId}`)}
            arquivo.mv(caminhoArquivo);
            }
            if(error) {return res.status(503).send({error:error, message:"terceiro erro"})}
            response = {
                mensagem: "Postagem criada!",
                postagemcriada: {
                    pos_id : results.insertId,
                    titulo: req.body.titulo,
                    descricao: req.body.descricao,
                    tags: req.body.pos_tags,  
                    usu_id: req.user.usu_id, 
                    cat_id: req.body.cat_id,
                    arquivo: req.files.path   
                    
                }
            }
            return res.status(201).send(response);
        });              
    });
}

   exports.getComentarios = (req, res) => {
            mysql.getConnection((error, conn) => {
                if(error) {return res.status(500).send({error:error})};
                conn.query(
                'SELECT * FROM com_comentarios',
                (error, resultado, fields) => {
                    if(error) { return res.status(500).send({error: error})}
                    return res.status(200).send({response: resultado});
                }
              );
            });
        }


   exports.postComentario = (req, res) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})}
                if(error){return res.status(500).send({error: mysql})}
                conn.query('INSERT INTO com_comentarios (usu_id, com_texto, pos_id) VALUES (?,?,?)',
                [req.user.usu_id, req.body.texto, req.params.pos_id],
                (error) => {
                    conn.release();
                    if(error) {return res.status(500).send({error:error})}
                    response = {
                        mensagem: "Comentário feito",
                        postagemcriada: {
                            usu_id: req.user.usu_id,
                            pos_id: req.params.pos_id,
                            texto : req.body.texto
                        }
                    }
                    return res.status(201).send(response);
                });
            });
        }

