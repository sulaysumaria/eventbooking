const Event = require('./../../models/event');
const User = require('./../../models/user');

const {dateToString} = require('./../../helpers/date');

async function events(eventIds) {
  try {
    const eventsResult = await Event.find({_id: {$in: eventIds}});

    return eventsResult.map(transformEvent);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function singleEvent(eventId) {
  try {
    const event = await Event.findById(eventId);

    return transformEvent(event);
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

function transformBooking(booking) {
  return {
    ...booking._doc,
    event: singleEvent.bind(this, booking.event),
    user: user.bind(this, booking.user),
    updatedAt: dateToString(booking.updatedAt),
    createdAt: dateToString(booking.createdAt),
  };
}

function transformEvent(event) {
  return {
    ...event._doc,
    date: dateToString(event.date),
    creator: user.bind(this, event.creator),
  };
}

module.exports = {
  events,
  singleEvent,
  user,
  transformBooking,
  transformEvent,
};
