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

const getUserById = async (id) => {
  const [rows] = await db.execute(
    "SELECT id, name, email, mobile FROM users WHERE id=?",
    [id]
  );

  return rows[0];
};

const getAllUsers = async () => {
  const [rows] = await db.execute(
    "SELECT id, name, email, mobile FROM users"
  );

  return rows;
};



module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
};