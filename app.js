const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/isAuth');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headres', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  return next();
});

app.use(isAuth);

app.use(
    '/graphql',
    graphqlHttp({
      graphiql: true,
      schema: graphQlSchema,
      rootValue: graphQlResolvers,
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
