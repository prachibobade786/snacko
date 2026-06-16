const userModel = require("../user/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (data) => {

  const existingUser =
    await userModel.getUserByEmail(data.email);

  if(existingUser){
    throw new Error("Email already exists");
  }

  const hashedPassword =
    await bcrypt.hash(data.password,10);

  data.password = hashedPassword;

  const result =
    await userModel.createUser(data);

  return result;
};

const login = async (email,password) => {

  const user =
    await userModel.getUserByEmail(email);

  if(!user){
    throw new Error("Invalid Email");
  }

  const isMatch =
    await bcrypt.compare(password,user.password);

  if(!isMatch){
    throw new Error("Invalid Password");
  }

  const token = jwt.sign(
    {
      id:user.id,
      email:user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn:"7d"
    }
  );

  return {
    token,
    user:{
      id:user.id,
      name:user.name,
      email:user.email
    }
  };
};



module.exports = {
  register,
  login,
};