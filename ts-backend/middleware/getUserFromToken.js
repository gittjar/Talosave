const jwt = require('jsonwebtoken');

const getUserFromToken = (req, res, next) => {
  const authorization = req.get('authorization');
  console.log('Authorization Header:', authorization); // Add logging

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7);

    let decodedToken = {};
    try {
      decodedToken = jwt.verify(req.token, process.env.SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    // console.log('Decoded Token:', decodedToken); // Add logging

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    req.user = decodedToken;
  } else {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  next();
};

module.exports = getUserFromToken;