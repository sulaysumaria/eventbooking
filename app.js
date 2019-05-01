const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

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

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type RootQuery {
          events: [Event!]!
        }

        type RootMutation {
          createEvent(eventInput: EventInput): Event
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
          });

          return event
              .save()
              .then((result) => {
                return {...result._doc};
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
