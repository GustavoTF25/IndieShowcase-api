const mysql = require('../mysql').pool;
const fs = require('fs');
 

exports.getposts = (req, res, next) => {
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

exports.postpostagem = (req, res, next)  => 
{   mysql.getConnection((error, conn) => 
    {  
         if(error) {return res.status(401).send({error:error, mensagem:"Sessão expirada"})}
         if(error){return res.status(500).send({error: mysql, mensagem: "erro ao inserir no banco"})} 
        const usuarioId = req.user.usu_id;
        const {arquivo} = req.files;
        //console.log(req.body)
       
        let caminhoArquivo = 'postagens/' + arquivo.name;
        conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) VALUES (?,?,?,?,?)', 
        [req.body.titulo, req.body.descricao, req.body.tags, usuarioId, req.body.cat_id], 
        (error,results) => {
            conn.release();    
            const postagemId = results.insertId;
            if(arquivo){
            caminhoArquivo = `postagens/${postagemId}/` + arquivo.name;
            if(!fs.existsSync(`postagens/${postagemId}/`)){fs.mkdirSync(`postagens/${postagemId}`)}
            arquivo.mv(caminhoArquivo);
            conn.query(`UPDATE pos_postagem SET pos_arquivo = (?) WHERE pos_id = ${postagemId}`,
            [caminhoArquivo], (error,results)=> {if(error){return res.status(500)}})
            }
            if(error) {return res.status(500).send({error:error, message:"falha no envio do arquivo"})}
            response = {
                mensagem: "Postagem criada!",
                postagemcriada: {
                    pos_id : results.insertId,
                    titulo: req.body.titulo,
                    descricao: req.body.descricao,
                    tags: req.body.pos_tags,  
                    usu_id: req.user.usu_id, 
                    cat_id: req.body.cat_id,
                    arquivo: caminhoArquivo  
                    
                }
            }
            return res.status(201).send(response);
        });              
    });
}