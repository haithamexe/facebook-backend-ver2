const User = require("../models/User");

const validEmail = (email) => {
  return email.match(
    /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?(\.[a-z]{2,8})?$/
  );
};

const validLength = (str, min, max) => {
  return str.length >= min && str.length <= max;
};

exports.registerValidation = async (body) => {
  const {
    first_name,
    last_name,
    username,
    email,
    password,
    gender,
    bYear,
    bMonth,
    bDay,
  } = body;

  if (
    !gender ||
    !bYear ||
    !bMonth ||
    !bDay ||
    !password ||
    !email ||
    !first_name ||
    !last_name
  ) {
    return { status: 400, message: "Please fill all fields" };
  }

  emailControl = email.toLowerCase().trim();

  if (!validEmail(emailControl)) {
    return { status: 400, message: "invalid email" };
  }
  if (!validLength(password, 8, 30)) {
    return { status: 400, message: "Password must be at least 8 characters" };
  }
  if (!validLength(first_name, 3, 15)) {
    return {
      status: 400,
      message: "First name must be between 3 and 15 characters",
    };
  }
  if (!validLength(last_name, 3, 15)) {
    return {
      status: 400,
      message: "Last name must be between 3 and 15 characters",
    };
  }
  if (bYear < 1900 || bYear > 2023) {
    return { status: 400, message: "Invalid year format" };
  }
  if (bMonth < 1 || bMonth > 12) {
    return { status: 400, message: "Invalid month format" };
  }
  if (bDay < 1 || bDay > 31) {
    return { status: 400, message: "Invalid day format" };
  }

  const existed = await User.findOne({ email: emailControl }, "email")
    .lean()
    .exec();
  if (existed) {
    return { status: 409, message: "Email address is already registered" };
  }

  return null;
};

exports.usernameValidation = async (username) => {
  let attempts = true;
  do {
    const exist = await User.findOne({ username: username }, "username")
      .lean()
      .exec();
    if (!exist) {
      attempts = false;
    } else {
      username = username + Math.floor(Math.random() * 1000);
    }
  } while (attempts);

  return username;
};
