const Booking = require('./../../models/booking');
const {transformBooking, transformEvent} = require('./merge');

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map(transformBooking);
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

      return transformBooking(booking);
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

      await Booking.deleteMany({_id: args.bookingId});

      return transformEvent(booking.event);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};
