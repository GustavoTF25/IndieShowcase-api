const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou no formato incorreto' });
  }

  const token = authorizationHeader.replace('Bearer ', '');

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.user = decoded;
    next();
  });
}
