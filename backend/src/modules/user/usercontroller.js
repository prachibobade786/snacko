const userService = require("../user/userservices");

const register = async (req,res) => {

  try {

    const result =
      await userService.register(req.body);

    res.status(201).json({
      success:true,
      message:"User Registered Successfully",
      data:result
    });

  } catch(error){

    res.status(400).json({
      success:false,
      message:error.message
    });

  }
};

const login = async (req,res) => {

  try {

    const {email,password} = req.body;

    const result =
      await userService.login(email,password);

    res.status(200).json({
      success:true,
      message:"Login Successful",
      data:result
    });

  } catch(error){

    res.status(401).json({
      success:false,
      message:error.message
    });

  }
};



module.exports = {
  register,
  login,
};