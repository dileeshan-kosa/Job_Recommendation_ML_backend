const bcrypt = require("bcryptjs");
const userprofileTable = require("../models/userCvDetailsModel");

async function UserSignUpController(req, res) {
  try {
    const { email, password, name } = req.body;

    const user = await userprofileTable.findOne({ email });

    // console.log("user", user);

    if (user) {
      throw new Error("Already User exits.");
    }

    if (!email) {
      throw new Error("Please Provide Email");
    }

    if (!password) {
      throw new Error("Please Provide password");
    }

    if (!name) {
      throw new Error("Please Provide name");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = await bcrypt.hashSync(password, salt);

    if (!hashPassword) {
      throw new Error("Something is wrong");
    }

    const payload = {
      ...req.body,
      password: hashPassword,
    };

    const userData = new userprofileTable(payload);
    const saveUser = await userData.save();

    res.status(201).json({
      data: saveUser,
      success: true,
      error: false,
      message: "User created Successfully!",
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = UserSignUpController;