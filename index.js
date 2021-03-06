const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database/dbConfig.js');

const server = express();

server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send('Its Alive!');
});

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username', 'password') // added password to response ***DON'T DO THIS! EVER!!***
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.post('/api/register', (req, res) => {
  // grab username and password from body
  const creds = req.body;

  // generate the hash from the pw
  const hash = bcrypt.hashSync(creds.password, 14); // rounds is 2^x ie 2^14
  console.log(bcrypt.getRounds(hash));

  // override pw with hash
  creds.password = hash;

  // save user to db
  db('users')
    .insert(creds)
    .then(ids => {
      res.status(200).json(ids);
    })
    .catch(err => res.status(400).json(err));
});

server.post('/api/login', (req, res) => {
  // grab credentials
  const creds = req.body;

  db('users')
    .where({ username: creds.username })
    .first()
    .then(user => {
      // user compareSync to compare pw to hashed password
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        // passwords match and user exists
        res.status(200).json({message: 'welcome!'});
      } else {
        // either username is invalid or password is wrong
        res.status(401).json({ error: 'Authentication failed' });
      }
    })
    .catch(err => res.status(400).json(err));
});

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
