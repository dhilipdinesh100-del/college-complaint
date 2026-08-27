const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_college_jwt_key_2026_dev_key_secure_987654321',
    {
      expiresIn: '7d',
    }
  );
};

module.exports = generateToken;
