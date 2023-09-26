const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateToken } = require("../helpers/tokens");
const { sendVerificationEmail } = require("../helpers/mailer");
const {
  registerValidation,
  usernameValidation,
} = require("../helpers/validation");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      gender,
      bYear,
      bMonth,
      bDay,
    } = req.body;

    const regValidation = await registerValidation(req.body);
    console.log(regValidation);
    if (regValidation) {
      return res
        .status(regValidation.status)
        .json({ message: regValidation.message });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    emailControl = email.toLowerCase().trim();
    first_nameControl = first_name.toLowerCase().trim();
    last_nameControl = last_name.toLowerCase().trim();
    const usernameControl = await usernameValidation(
      first_nameControl + last_nameControl
    );

    const user = await new User({
      first_name: first_nameControl,
      last_name: last_nameControl,
      username: usernameControl,
      email: emailControl,
      password: hashedPassword,
      gender,
      bYear,
      bMonth,
      bDay,
    });
    await user.save();
    const emailVerficationToken = generateToken(
      { id: user._id.toString() },
      "60m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerficationToken}`;
    sendVerificationEmail(
      emailControl,
      first_nameControl.slice(0, 1).toUpperCase() + first_nameControl.slice(1),
      url
    );

    const token = generateToken({ id: user._id.toString() }, "60m");

    return res.status(200).json({
      id: user._id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      verified: user.verified,
      picture: user.picture,
      token: token,
      message:
        "Register is successful, please check your email to verify registration",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    console.log(token);
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Account not found" });
    }
    if (user.verified) {
      return res.status(400).json({ message: "Account already verified" });
    }
    user.verified = true;
    await user.save();
    return res.status(200).json({ message: "Account verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailControl = email.toLowerCase().trim();
    if (!emailControl || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const user = await User.findOne({ email: emailControl }).lean().exec(); // lean() returns a plain JS object instead of a mongoose document  // exec() returns a promise instead of a query      // findOne() returns the first document that matches the query criteria or null if no document matches
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken({ id: user._id.toString() }, "60m");
    return res.status(200).json({
      id: user._id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      verified: user.verified,
      picture: user.picture,
      token: token,
      message: "Login is successful",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
