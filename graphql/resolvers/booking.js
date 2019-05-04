const Booking = require('./../../models/booking');
const {transformBooking, transformEvent} = require('./merge');

module.exports = {
  bookings: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('Access Denied');
      }

      const bookings = await Booking.find();

      return bookings.map(transformBooking);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  bookEvent: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('Access Denied');
      }

      const booking = new Booking({
        user: req.userId,
        event: args.eventId,
      });

      await booking.save();

      return transformBooking(booking);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  cancelBooking: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error('Access Denied');
      }

      const booking = await Booking.findById(args.bookingId).populate([
        {path: 'event'},
      ]);

      await Booking.deleteMany({_id: args.bookingId});

      return transformEvent(booking.event);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};
