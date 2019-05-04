const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./../../models/user');

module.exports = {
  createUser: async (args) => {
    try {
      const {email, password} = args.userInput;

      let user = await User.findOne({email});
      if (user) {
        throw new Error('User with this email already exists.');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      user = new User({
        email,
        password: hashedPassword,
      });

      const result = await user.save();
      result.password = null;
      return result;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  login: async (args) => {
    try {
      const {email, password} = args;

      const user = await User.findOne({email});

      if (!user) {
        throw new Error('Invalid Email/Password.');
      }

      const isEqual = await bcrypt.compare(password, user.password);

      if (!isEqual) {
        throw new Error('Invalid Email/Password.');
      }

      const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
          },
          'somesupersecretkey',
          {
            expiresIn: '1h',
          }
      );

      return {
        userId: user._id,
        token,
        tokenExpiration: 1,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};
