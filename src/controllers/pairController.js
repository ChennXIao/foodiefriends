const { decodeFromToken } = require("../controllers/userController");
const PairModel = require("../models/pairModel");
const RestaurantModel = require("../models/restaurantModel");

const _ = require("lodash");
var similarity = require("compute-cosine-similarity");

const PairController = {
  makePair: (req, res) => {
    const { USERA, USERB, restaurant, date, time, timestamp } = req.body;
console.log(JSON.stringify(req.body));
    let formatedDate = new Date(date);

    formatedDate = formatedDate.toISOString().split("T")[0]; // Extracts the YYYY-MM-DD part
console.log(formatedDate);

let formattedTimeStmap = new Date(timestamp); // Your input
formattedTimeStmap = formattedTimeStmap.toISOString().slice(0, 19).replace("T", " ");
console.log(formattedTimeStmap);
    try {
      PairModel.ifPairExist(USERB, USERA, (err, results) => {
        if (err) {
          throw err;
        }

        console.log(results);

        if (_.isEmpty(results)) {
          PairModel.createPair(
            USERA,
            USERB,
            restaurant,
            formatedDate,
            time,
            formattedTimeStmap,
            false,
            (err, results) => {
              if (err) {
                console.error("Error creating Pair:", err);
                res.status(500).json({ error: "Internal Server Error" });
              } else {
                console.log("Pair created successfully:", results);
                res.status(200).json({ ok: true, status: 0 });
              }
            }
          );
        } else {
          // Change to false(corect in real scenario)
          PairModel.updatePair(USERB, USERA, true, (err, results) => {
            if (err) {
              console.error("Error updating Pair:", err);
              res.status(500).json({ error: "Internal Server Error" });
            } else {
              console.log("Match updated successfully:", results);
              res.status(200).json({ ok: true, status: 1 });
            }
          });
        }
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
  updatePair: (req, res) => {
    const { USERA, USERB } = req.body;
    try {
      PairModel.updatePair(USERA, USERB, true, (err, results) => {
        if (err) {
          console.error("Error creating filter:", err);
          return res.status(204).json({ error: "Internal Server Error" });
        }

        console.log("Filter updated successfully:", results);
        res.status(200).json({ ok: true });
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "internal server error" });
    }
  },
  checkPair: (req, res) => {
    let userID = decodeFromToken(req);

    try {
      PairModel.getPairs(userID, (err, results) => {
        if (err) {
          throw err;
        }

        let response = { data: [] };

        if (_.isEmpty(results)) {
          res
            .status(200)
            .json({ message: "Cannot find any pairs for the user" });
        } else {
          results.forEach((element) => {
            response.data.push({
              gender: element.gender,
              member: element.nickname,
              name: element.name,
            });
          });

          res.status(200).json(response);
        }
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "internal server error" });
    }
  },

  getLikedRestaurant: (req, res) => {
    let userID = decodeFromToken(req);

    try {
      RestaurantModel.LikedRestaurant(userID, (err, results) => {
        if (err) throw err;

        if (_.isEmpty(results)) {
          res
            .status(204)
            .json({ message: "No restaurant data found for the user" });
        } else {
          console.log(`Member ${userID}'s filter is found: `, results);
          res.status(200).json({ ok: true, results });
        }
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "internal server error" });
    }
  },
  getMatches: (req, res) => {
    let userID = decodeFromToken(req);
    let response = { data: [] };
    try {
      PairModel.ifMatched(true, userID, (err, results) => {
        if (err) throw err;
        if (_.isEmpty(results)) {
          response.data = null;

          return res.status(200).json(response);
        } else {
          results.forEach((e) => {
            console.log(e);
            if (userID == e.USERA) {
              response.data.push({
                id: e.id,
                user: e.USERB,
                date: e.date,
                time: e.time,
                timestamp: e.timestamp,
                restaurant: e.restaurant,
              });
            } else {
              response.data.push({
                id: e.id,
                user: e.USERA,
                date: e.date,
                time: e.time,
                timestamp: e.timestamp,
                restaurant: e.restaurant,
              });
            }
          });
        }
        console.log(`Member ${userID}'s matches is found: `, results);
        res.status(200).json(response);
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "internal server error" });
    }
  },
  cancelDate: async (req, res) => {
    const cancelId = req.params.id;

    try {
      await new Promise((resolve, reject) => {
        PairModel.cancelDate(cancelId, (err, results) => {
          if (err) {
            console.error("Error cancel match:", err);
            reject(err);
          } else {
            console.log("Match cancel successfully:", results);
            resolve(results);
          }
        });
      });

      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: true, message: "internal server error" });
    }
  },
};
module.exports = PairController;
