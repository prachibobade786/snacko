const db = require("../../config/db");

const createUser = async (user) => {
  const query = `
    INSERT INTO users(name,email,password,mobile)
    VALUES(?,?,?,?)
  `;

  const [result] = await db.execute(query, [
    user.name,
    user.email,
    user.password,
    user.mobile
  ]);

  return result;
};

const getUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email=?",
    [email]
  );

  return rows[0];
};



module.exports = {
  createUser,
  getUserByEmail,
};