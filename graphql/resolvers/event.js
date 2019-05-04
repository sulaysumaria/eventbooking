const Event = require('./../../models/event');
const User = require('./../../models/user');
const {transformEvent} = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map(transformEvent);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  createEvent: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('Access Denied');
      }

      const {title, description, price, date} = args.eventInput;

      const event = new Event({
        title,
        description,
        price,
        date: new Date(date),
        creator: req.userId,
      });

      const result = await event.save();

      const userResult = await User.findById({
        _id: req.userId,
      });

      if (!userResult) {
        throw new Error('No user found.');
      }

      userResult.createdEvents.push(event);

      await userResult.save();

      return transformEvent(result);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};
