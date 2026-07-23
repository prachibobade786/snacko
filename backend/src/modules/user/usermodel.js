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
    "SELECT id, name, email, mobile, role FROM users WHERE id=?",
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



const updateUser = async (id, user) => {
  const query = `
    UPDATE users 
    SET name = ?, email = ?, mobile = ?
    WHERE id = ?
  `;
  await db.execute(query, [user.name, user.email, user.mobile, id]);
  return await getUserById(id);
};

const updateUserPassword = async (email, password) => {
  const query = `
    UPDATE users 
    SET password = ?
    WHERE email = ?
  `;
  const [result] = await db.execute(query, [password, email]);
  return result;
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
  updateUserPassword,
};