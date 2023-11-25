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
exports.postpostagem = (req, res, next)  => {
    mysql.getConnection((error, conn) => 
    {  
        if(error) {return res.status(401).send({error:error, mensagem:"Sessao expirada"})}
        if(error){return res.status(500).send({error: mysql, mensagem: "erro ao inserir no banco"})} 
        const usuarioId = req.user.usu_id;
        const arquivos = req.files;
        const { img_capa } = req.files;
        const { titulo, descricao, tags, cat_id } = req.body;
        if (!arquivos || Object.keys(arquivos).length === 0) {
            return res.status(400).send({ mensagem: "Nenhum arquivo enviado" });
        }
        if(!isImagem(img_capa)){return res.status(400).send({mensagem: "Esse arquivo deve uma imagem"})} 

        conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) VALUES (?,?,?,?,?)', 
        [req.body.titulo, req.body.descricao, req.body.tags, usuarioId, req.body.cat_id], 
        (error,results) => {
            conn.release();    
            const postagemId = results.insertId;
            const caminhoCapa = `postagens/${postagemId}` + img_capa.name;
            conn.query(`UPDATE pos_postagem SET pos_capa = ? WHERE pos_id = ${postagemId}`, [caminhoCapa])
            const inserirArquivo = (arquivo) => {
                if (arquivo) {
                    const caminhoArquivo = `postagens/${postagemId}/` + arquivo.name;
                    if (!fs.existsSync(`postagens/${postagemId}/`)) {fs.mkdirSync(`postagens/${postagemId}`, { recursive: true });}
                    
                    arquivo.mv(caminhoArquivo, (err) => {
                        if (err) {return res.status(500).send({ error: err, message: "Falha no envio do arquivo" });}
                        conn.query('INSERT INTO arq_arquivos (arq_nome, arq_extensao, pos_id) VALUES (?,?,?)',
                        [arquivo.name, arquivo.mimetype, postagemId],
                        (error) => {if (error) {return res.status(500).send({ error: error, message: "Falha no envio do arquivo no servidor" });}}
                        );
                    });
                }
            };
            Object.values(arquivos).forEach(inserirArquivo);

            const response = {
                mensagem: "Postagem criada!",
                postagemcriada: {
                    pos_id: postagemId,
                    titulo: titulo,
                    descricao: descricao,
                    tags: tags,
                    usu_id: usuarioId,
                    cat_id: cat_id,
                    capa: img_capa.name,
                    arquivos: Object.values(arquivos).map((arquivo) => arquivo.name),
                },
            };
            return res.status(201).send(response);
        });              
    });
 }
function isImagem(file){
    let extensao = file.name.split('.').pop();
    let mimeType = mime.lookup(extensao)
    return mimeType && mimeType.startsWith('image');
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

exports.postGostei = (req, res) => {
    let gostei = ' ';
    mysql.getConnection((error, conn) => {
        if(eror){return res.status(500).send({error:error})}
            conn.query('SELECT usu_id, pos_id FROM gos_gostei', [req.user.usu_id, req.params.pos_id]);
            conn.release();
            if(results.length > 0 ){
                gostei = 0; 
                conn.query('UPDATE gos_gostei SET gos_valor = ? where usu_id = ? AND pos_id = ?', [gostei, req.user.usu_id, req.params.pos_id])
                conn.release();
            }else{
                //conn.query('SELECT usu_id, pos_id FROM gos_gostei', [req.user.usu_id, req.params.pos_id])
                gostei = 1;
                conn.query('INSERT INTO gos_gostei (usu_id, pos_id, gos_valor) ', [req.user.usu_id, req.params.pos_id, gostei])
                conn.release();
                
            }
    })
}        
