const bcrypt = require('bcryptjs');

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
};
