const bcrypt = require("bcrypt");

//hash function
exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) {
        reject(error);
      }
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) {
          reject(error);
        }
        resolve(hash);
      });
    });
  });
};

//compare || decrypt function
exports.comparePassword = async (password, hashed) => {
  if (!password || !hashed) {
    throw new Error(
      "Both plain text password and hashed password are required"
    );
  }
  return await bcrypt.compare(password, hashed);
};
