const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_KEY;


exports.obrigatorio = (req, res, next) => {
    const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    console.log(token)
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    // Token válido, decodificado contém os dados do usuário, incluindo usu_id
    req.userid = decoded.usu_id;
    next();
  });
  
};

/*
exports.opcional = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        next();
    }
  
}*/



