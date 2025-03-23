const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const secretKey = "key";
// not using _
const _ = require("lodash");

const UserController = {
  createUser: async (req, res) => {
    try {
      console.log(req);
      const { email, password } = req.body;

      const existingUser = await new Promise((resolve, reject) => {
        UserModel.ifUserExist(email, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      if (!_.isEmpty(existingUser)) {
        return res.status(200).json({ message: "Email has been signed!" });
      } else {
        await new Promise((resolve, reject) => {
          UserModel.newUser(email, password, (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
        console.log("User created successfully");
        res.status(200).json({ ok: true });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  },

  authenticateUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      const results = await new Promise((resolve, reject) => {
        UserModel.findByEmailAndPassword(email, password, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      if (results.length === 0) {
        return res.status(400).json({ error: true });
      }

      const token = generateToken(
        results[0].id,
        results[0].name,
        email,
        password
      );
      console.log("Generated Token:", token);
      res.status(200).json({ ok: true, token: token });
    } catch (error) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  },

  verifyUser: (req, res) => {
    try {
      let userID = decodeFromToken(req);
      let response = { id: userID };
      res.status(200).json(response);
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  },
};

function generateToken(id, name, email, password) {
  const payload = {
    id: id,
    name: name,
    email: email,
    password: password,
  };
  const options = {
    expiresIn: "100h",
  };

  // Create the token
  const token = jwt.sign(payload, secretKey, options);
  console.log("Generated Token:", token);
  return token;
}

function decodeFromToken(request) {
  const authHeader = request.get("authorization");
  let decodedToken;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    decodedToken = authHeader.split("Bearer ")[1];
  }
  let payload = jwt.verify(decodedToken, secretKey);
  return payload.id;
}

module.exports = { UserController, decodeFromToken, generateToken };
