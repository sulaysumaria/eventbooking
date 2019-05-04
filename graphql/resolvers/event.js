const Event = require('./../../models/event');
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
  createEvent: async (args) => {
    try {
      const {title, description, price, date} = args.eventInput;

      const event = new Event({
        title,
        description,
        price,
        date: new Date(date),
        creator: '5cc9b9180cab320ee6bf3ea7',
      });

      const result = await event.save();

      const userResult = await User.findById({
        _id: '5cc9b9180cab320ee6bf3ea7',
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
