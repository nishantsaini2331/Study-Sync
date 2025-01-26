const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRE } = require("../config/dotenv");

function generateAuthToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    roles: user.roles,
    name: user.name,
  };

  const secretKey = JWT_SECRET;
  const options = {
    expiresIn: JWT_EXPIRE,
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
}

module.exports = generateAuthToken;
