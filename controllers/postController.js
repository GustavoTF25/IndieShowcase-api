const mysql = require('../mysql').pool;
const fs = require('fs');
const mime = require('mime-types');
//const { MIMEType } = require('util');//

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
        //const {arquivo} = req.files;
        //const {arquivo2} = req.files;
        //const {arquivo3} = req.files;
        //const {arquivo4} = req.files;
        //const {arquivo5} = req.files;
        //let arquivos = [arquivo, arquivo2, arquivo3, arquivo4, arquivo5];
        const arquivos = req.files;
        const { titulo, descricao, tags, cat_id } = req.body;
        //let caminhoArquivo = 'postagens/' + arquivo.name;
        conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) VALUES (?,?,?,?,?)', 
        [req.body.titulo, req.body.descricao, req.body.tags, usuarioId, req.body.cat_id], 
        (error,results) => {
            conn.release();    
            const postagemId = results.insertId;
            const inserirArquivo = (arquivo) => {
                if (arquivo) {
                    const caminhoArquivo = `postagens/${postagemId}/` + arquivo.name;
                    if (!fs.existsSync(`postagens/${postagemId}/`)) {fs.mkdirSync(`postagens/${postagemId}`, { recursive: true });}
                    
                    arquivo.mv(caminhoArquivo, (err) => {
                        if (err) {return res.status(500).send({ error: err, message: "Falha no envio do arquivo" });}
                        conn.query('INSERT INTO arq_arquivos (arq_nome, arq_extensao, pos_id) VALUES (?,?,?)',
                        [arquivo.name, arquivo.mimetype, postagemId],
                        (error) => {if (error) {return res.status(500).send({ error: error, message: "Falha ao inserir no banco" });}}
                        );
                    });
                }
            };

            // Percorre o array de arquivos e insere um a um
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
                    arquivos: Object.values(arquivos).map((arquivo) => arquivo.name),
                },
            };
            return res.status(201).send(response);
        });              
    });
}