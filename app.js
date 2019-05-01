const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
    '/graphql',
    graphqlHttp({
      graphiql: true,
      schema: buildSchema(`
        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type User {
          _id: ID!
          email: String!
          password: String
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
          events: [Event!]!
        }

        type RootMutation {
          createEvent(eventInput: EventInput): Event
          createUser(userInput: UserInput): User
        }

        schema {
          query: RootQuery
          mutation: RootMutation
        }
      `),
      rootValue: {
        events: () => {
          return Event.find()
              .then((events) => {
                return events.map((event) => {
                  return {...event._doc};
                });
              })
              .catch((e) => {
                console.log(e);
                throw e;
              });
        },
        createEvent: (args) => {
          const {title, description, price, date} = args.eventInput;

          const event = new Event({
            title,
            description,
            price,
            date: new Date(date),
            creator: '5cc9b9180cab320ee6bf3ea7',
          });

          let createdEvent;

          return event
              .save()
              .then((result) => {
                createdEvent = {...result._doc};

                return User.findById({_id: '5cc9b9180cab320ee6bf3ea7'});
              })
              .then((user) => {
                if (!user) {
                  throw new Error('No user found.');
                }

                user.createdEvents.push(event);

                return user.save();
              })
              .then(() => {
                return createdEvent;
              })
              .catch((e) => {
                console.log(e);
                throw e;
              });
        },
        createUser: (args) => {
          const {email, password} = args.userInput;

          return User.findOne({email})
              .then((user) => {
                if (user) {
                  throw new Error('User with this email already exists.');
                }

                return bcrypt.hash(password, 12);
              })
              .then((hashedPassword) => {
                const user = new User({
                  email,
                  password: hashedPassword,
                });

                return user.save();
              })
              .then((result) => {
                return {...result._doc, password: null};
              })
              .catch((e) => {
                console.log(e);
                throw e;
              });
        },
      },
    })
);

mongoose
    .connect('mongodb://localhost:27017/eventbooking', {
      useNewUrlParser: true,
    })
    .then(() => {
      app.listen(3000);
    })
    .catch((e) => {
      console.log(e);
    });
