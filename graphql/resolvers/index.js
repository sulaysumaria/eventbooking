const bcrypt = require('bcryptjs');

const Event = require('./../../models/event');
const User = require('./../../models/user');
const Booking = require('./../../models/booking');

async function events(eventIds) {
  try {
    const eventsResult = await Event.find({_id: {$in: eventIds}});

    return eventsResult.map((event) => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator),
      };
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function singleEvent(eventId) {
  try {
    const event = await Event.findById(eventId);

    return {
      ...event._doc,
      date: new Date(event._doc.date).toISOString(),
      creator: user.bind(this, event._doc.creator),
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function user(userId) {
  try {
    const userResult = await User.findById(userId);

    return {
      ...userResult._doc,
      createdEvents: events.bind(this, userResult._doc.createdEvents),
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map((event) => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        };
      });
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

      const createdEvent = {
        ...result._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
      };

      const userResult = await User.findById({
        _id: '5cc9b9180cab320ee6bf3ea7',
      });

      if (!userResult) {
        throw new Error('No user found.');
      }

      userResult.createdEvents.push(event);

      await userResult.save();

      return createdEvent;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
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
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map((booking) => {
        return {
          ...booking._doc,
          event: singleEvent.bind(this, booking.event),
          user: user.bind(this, booking.user),
          createdAt: new Date(booking.createdAt).toISOString(),
          updatedAt: new Date(booking.updatedAt).toISOString(),
        };
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  bookEvent: async (args) => {
    try {
      const booking = new Booking({
        user: '5cc9b9180cab320ee6bf3ea7',
        event: args.eventId,
      });

      await booking.save();

      return {
        ...booking._doc,
        event: singleEvent.bind(this, booking.event),
        user: user.bind(this, booking.user),
        createdAt: new Date(booking.createdAt).toISOString(),
        updatedAt: new Date(booking.updatedAt).toISOString(),
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate([
        {path: 'event'},
      ]);

      const event = {
        ...booking.event._doc,
        creator: user.bind(this, booking.event._doc.creator),
      };

      await Booking.deleteMany({_id: args.bookingId});

      return event;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};
