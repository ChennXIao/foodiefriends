const bodyParser = require('body-parser');
const path = require('path');
const port = 8000;
const mysql = require('mysql2');
var socketio = require('socket.io')
const cors = require('cors');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json()); // 🚀 Make sure JSON body is parsed
app.use(express.urlencoded({ extended: true })); // For form data
const server = http.createServer(app);
const aws = require('aws-sdk');
const UserModel = require('./src/models/userModel');
const { generateToken } = require('./src/controllers/userController');

const _ = require("lodash");

const jwt = require('jsonwebtoken');
const secretKey = 'key';
require('dotenv').config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const awsID = process.env.AWS_KEY_ID;
const awsKEY = process.env.AWS_SECRET_KEY;
const awsRegion = process.env.AWS_REGION;
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const googleClientId = process.env.GOOGLE_Client_ID;
const googleClientSecret = process.env.GOOGLE_Client_Secret;
const DB_PORT = process.env.DB_PORT;
const logger = require('./src/config/logger');

logger.info('Server is starting...');
logger.warn('This is a warning message');
logger.error('Something went wrong!');

// Create a connection pool
const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: 'foodiefriend',
  port: DB_PORT,
  insecureAuth: true,
  connectionLimit: 10,
});

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:8000",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render(path.join(__dirname, 'views', 'index.ejs'));
});

app.get('/profile', (req, res) => {
  res.render(path.join(__dirname, 'views', 'profile.ejs'));
});

app.get('/match', (req, res) => {
  res.render(path.join(__dirname, 'views', 'matches.ejs'));
});
app.get('/member', (req, res) => {
  res.render(path.join(__dirname, 'views', 'member.ejs'));
});

app.get('/my-matches', (req, res) => {
  res.render(path.join(__dirname, 'views', 'my-matches.ejs'));
});
app.get('/api/getApiKey', (req, res) => {
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

app.get('/api/getUnsplashApiKey', (req, res) => {
  res.json({ apiKey: process.env.UNSPLASH_API_KEY });
});

app.get('/getPlaceDetails/:placeId', async (req, res) => {
  console.log(req.params.placeId);
  const placeId = req.params.placeId;
  const gMapKey = process.env.GOOGLE_MAPS_API_KEY;
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${gMapKey}`;
  console.log(detailsUrl)
  try {
    const response = await fetch(detailsUrl);
    const detailsData = await response.json();
    res.json(detailsData);
  } catch (error) {
    console.log(placeId, gMapKey);
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Routes
const userRoute = require('./src/routes/userRoutes');
const restaurantRoute = require('./src/routes/restaurantRoutes');
const matchRoute = require('./src/routes/matchRoutes');
const profileRoute = require('./src/routes/profileRoutes');

app.use(userRoute);
app.use(restaurantRoute);
app.use(matchRoute);
app.use(profileRoute);

const connectedUsers = {};
let relationships = [];
let UserA;
let UserB;
// Socket.io connection event
io.on('connection', (socket) => {
  console.log('A user connected with default socket ID:', socket.id);
  // Listen for the 'setUserId' event
  socket.on('setUserId', (userId) => {
    // Set a custom user ID and associate it with the socket ID
    socket.userId = userId;
    UserA = userId
    console.log("現在的user是: ", UserA)
    connectedUsers[userId] = socket.id;
    console.log(connectedUsers)
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

  socket.on('like', async (likedUserId) => {
    UserB = likedUserId
    console.log(UserA, " like ", UserB)
    // Notify both users
    socket.emit('notification', `You have a new match with ${likedUserId}!`);
    console.log("被liked的: ", likedUserId)
    console.log("SEND like to: ", likedUserId, connectedUsers[likedUserId])

    if (likedUserId in connectedUsers) {
      io.to(connectedUsers[likedUserId]).emit('notification', `You have a new match with ${UserA}!`);
    }

  });

  async function getPair() {
    try {
      const pairArr = [];
      return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
          if (error) {
            reject(error);
            return;
          }

          const selectQuery = `SELECT * FROM pairs;`;

          connection.query(selectQuery, (queryError, results) => {
            connection.release();

            if (queryError) {
              reject(queryError);
            } else {
              resolve(results);
            }
          });
        });
      });

      results.forEach((element) => {
        pairArr.push([element.UserA, element.UserB]);
      });

      return pairArr;
    } catch (error) {
      console.error('Error in getPair:', error.message);
      throw error;
    }
  }

  //生成要比對的pair和將pair放入db
  async function repair(callback) {
    if (UserA != null && UserB != null) {
      relationships.push([UserA, UserB])
      console.log("The relationship pair is: ", relationships[relationships.length - 1])
      console.log("The relationship pair is: ", relationships)

      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
        const insertQuery = `INSERT INTO pairs(UserA,UserB)values(?,?);`
        const values = [UserA, UserB];

        connection.query(insertQuery, values, (queryError, results) => {
          connection.release();

          callback(queryError, results);
        });
      });
      return relationships
    }
  }

  async function check(pairArr, relationships) {
    if (relationships != null && pairArr != null) {
      let pairResult = pairArr.some((aPair) => aPair[0] === relationships[relationships.length - 1][1] && aPair[1] === relationships[relationships.length - 1][0])
      return pairResult
    } else {
      return false
    }

  }

  // Listen for user disconnection
  socket.on('disconnect', () => {

    console.log('User disconnected');
  });

  function checkMutualLike() {

    let results;
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT * FROM pairs;`
      connection.query(selectQuery, (queryError, results) => {
        connection.release();
        results = results

        callback(queryError, results);
      });
    });
    return results
  }

});

const session = require('express-session');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
app.use(session({ secret: 'key', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

// passport.use(new GoogleStrategy({
//     clientID:  googleClientId,
//     clientSecret:  googleClientSecret,
//     callbackURL: "/auth/google/callback"
//   },
//   async function(accessToken, refreshToken, profile, done) {
//     const googleUserMail = profile._json.email
//     try {

//       const existingUser = await new Promise((resolve, reject) => {
//           UserModel.ifUserExist(googleUserMail, (err, results) => {
//               if (err) {
//                   reject(err);
//               } else {
//                   resolve(results);
//               }
//           });
//       });

//       if (!_.isEmpty(existingUser)) {
//           const results = await new Promise((resolve, reject) => {
//             UserModel.findByEmailAndPassword(googleUserMail, "google", (err, results) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(results);
//                 }
//             });
//         });

//         if (results.length === 0) {
//           return done(null, false, { message: 'Invalid credentials' });
//         }

//         const token = generateToken(results[0].id, null, googleUserMail, null);
//           const user = {
//             email: googleUserMail,
//             token: token
//         };
//           return done(null, user);
//               } else {
//             const newUserResults = await new Promise((resolve, reject) => {
//               UserModel.newUser(googleUserMail, 'google', (err, results) => {
//                   if (err) {
//                       reject(err);
//                   } else {
//                       resolve(results);
//                   }
//               });
//           });
//           const token = generateToken(newUserResults.insertId, null, googleUserMail, 'google');
//           console.log('Generated Token:', token);
//           const user = {
//             email: googleUserMail,
//             token: token
//         };
//           return done(null, user);
//         }
//   } catch (error) {
//       console.error('Error creating user:', error);
//       return done(error, false, { message: 'Internal Server Error' });
//     }
//     return done(null, profile);
//   }
// ));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', "profile"] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    res.cookie('authToken', req.user.token, { httpOnly: false, secure: true, sameSite: 'None' });

    res.redirect(`/profile`);

  }
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

server.listen(port, () => {
  console.log(`Server is running on port 80`);
});
