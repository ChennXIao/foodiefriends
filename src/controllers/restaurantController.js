const UserModel = require("../models/userModel");
const RestaurantModel = require("../models/restaurantModel");
const {
  UserController,
  decodeFromToken,
} = require("../controllers/userController");

const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";
const _ = require("lodash");
const PairModel = require("../models/pairModel");

const RestaurantController = {
  // getRestaurant: (req, res)=>{
  //     RestaurantModel.getAllRestaurant((err,results)=>{
  //         if(_.isEmpty(results)){
  //             return res.status(200).json({"message":"cannot find any"});
  //         }else{
  //             let response={"data":[]}
  //             // console.log(results)
  //             results.forEach(element => {
  //                 response.data.push({"name":element.name,"member":element.member_id})
  //             });

  //             return res.status(200).json(response)
  //         }

  //     })
  // },
  getRestaurantsByUser: (req, res) => {
    try {
      const userIDForRestaurant = req.params.userId;
      let response = [];

      RestaurantModel.getUserRestaurant(userIDForRestaurant, (err, results) => {
        if (err) throw err;

        if (_.isEmpty(results)) {
          return res.status(200).json({ message: "Cannot find any" });
        } else {
          console.log(results.slice(0, 3));
          results.slice(0, 3).forEach((e) => {
            response.push(e);
          });
          return res.status(200).json({ ok: true, data: response });
        }
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  getRestaurantById: (req, res) => {
    try {
      let userID = decodeFromToken(req);
      let restaurantId = req.params.restaurantId;
      let response = [];
      RestaurantModel.getRestaurantFromId(restaurantId, (err, results) => {
        if (_.isEmpty(results)) {
          return res
            .status(404)
            .json({ error: true, message: "Cannot find any" });
        } else {
          response.push(results);
          return res.status(200).json({ ok: true, data: response });
        }
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: true, message: "Error creating restaurant" });
    }
  },

  addRestaurants: async (req, res) => {
    const { name } = req.body;
    let userID = decodeFromToken(req);
    console.log(req.body);
    try {
      for (const restaurant of name) {
        console.log(restaurant);
        let restaurantInfo = [
          restaurant.name,
          restaurant.address,
          restaurant.price,
          restaurant.place_id,
        ];

        // First, check if the restaurant already exists in restaurant_info
        const existingRestaurant = await new Promise((resolve, reject) => {
          RestaurantModel.ifRestaurantExist(restaurant.place_id, (err, results) => {
            if (err) throw err;
            if (_.isEmpty(results)) {
              resolve(null);
            } else {
              resolve(results[0]);
            }
          });
        });
console.log(existingRestaurant);
        let restaurantId;
        if (existingRestaurant) {
          restaurantId = existingRestaurant.id;
          console.log("Restaurant already exists with ID:", restaurantId);
        } else {
          restaurantId = await new Promise((resolve, reject) => {
            RestaurantModel.addRestaurants(restaurantInfo, (err, results) => {
              if (err) {
                console.error("Error creating restaurant:", err);
                reject(err);
              } else {
                console.log("Restaurant created successfully:", results);
                resolve(results.insertId); // Return the new restaurant id
              }
            });
          });
        }

        await new Promise((resolve, reject) => {
          RestaurantModel.addUserRestaurantId(userID, restaurantId, (err, results) => {
            if (err) {
              console.error("Error creating user-restaurant relationship:", err);
              reject(err);
            } else {
              console.log("User-restaurant relationship created successfully:", results);
              resolve(results);
            }
          });
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: true, message: "Error creating restaurant" });
    }
  },

  addRestaurant: async (req, res) => {
    const { id } = req.body;
    console.log(req.body,id, 'wrwrwrwr');
    let userID = decodeFromToken(req);

    try {
      await new Promise((resolve, reject) => {
        RestaurantModel.addUserRestaurantId(userID, id, (err, results) => {
          if (err) {
            console.error("Error creating restaurant:", err);
            reject(err);
          } else {
            console.log("restaurant created successfully:", results);
            resolve(results);
            console.log("Restaurant add in");
          }
        });
      });

      res.status(200).json({ ok: true });
    } catch (error) {
      res
        .status(500)
        .json({ error: true, message: "Error creating restaurant" });
    }
  },

  updateUserRestaurant: async (req, res) => {
    const { former, name } = req.body;
    console.log(former);
    console.log(name);
    let userID = decodeFromToken(req);

    try {
      for (const restaurant of name) {
        console.log(restaurant);
        let restaurantInfo = [
          restaurant.name,
          restaurant.address,
          restaurant.price,
          restaurant.place_id,
        ];

        await new Promise((resolve, reject) => {
          RestaurantModel.ifRestaurantExist(
            restaurant.place_id,
            (err, results) => {
              if (err) throw err;
              if (_.isEmpty(results)) {
                RestaurantModel.addRestaurants(
                  restaurantInfo,
                  (err, results) => {
                    if (err) {
                      console.error("Error creating restaurant:", err);
                      reject(err);
                    } else {
                      console.log("restaurant created successfully:", results);
                      resolve(results);
                      RestaurantModel.updateUserRestaurantId(
                        userID,
                        former,
                        results.insertId,
                        (err, results) => {
                          if (err) {
                            console.error("Error updated restaurant:", err);
                            reject(err);
                          } else {
                            console.log(
                              "User restaurantID updated successfully:",
                              results
                            );
                            resolve(results);
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                console.log("restaurant created successfully:", results);
                resolve(results);
                console.log(results);
                RestaurantModel.updateUserRestaurantId(
                  userID,
                  former,
                  results[0].id,
                  (err, results) => {
                    if (err) {
                      console.error("Error updated restaurant:", err);
                      reject(err);
                    } else {
                      console.log(
                        "User restaurantID updated successfully:",
                        results
                      );
                      resolve(results);
                    }
                  }
                );
              }
            }
          );
        });
      }
      res.status(200).json({ ok: true });
    } catch (error) {
      res
        .status(500)
        .json({ error: true, message: "Error updated restaurant" });
    }
  },
  checkFilter: (req, res) => {
    try {
      let userID = decodeFromToken(req);
      let response;
      RestaurantModel.ifFilterExist(userID, (err, results) => {
        if (err) throw err;
        if (_.isEmpty(results)) {
          response = null;
        } else {
          response = results;
        }

        console.log(`Member ${userID}'s filter is found: `, results);
        res.status(200).json({ ok: true, data: response });
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  createFilter: (req, res) => {
    try {
      const { gender, min, max, lat, lng } = req.body;
      let userID = decodeFromToken(req);

      RestaurantModel.ifFilterExist(userID, (err, results) => {
        if (err) throw err;

        if (_.isEmpty(results)) {
          RestaurantModel.addFilter(
            gender,
            min,
            max,
            lat,
            lng,
            userID,
            (err, results) => {
              if (err) throw err;
              console.log("Filter created successfully:", results);
              res.status(200).json({ ok: true });
            }
          );
        } else {
          RestaurantModel.updateFilter(
            gender,
            min,
            max,
            lat,
            lng,
            userID,
            (err, results) => {
              if (err) throw err;
              console.log("Filter updated successfully:", results);
              res.status(200).json({ ok: true });
            }
          );
        }
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  getDate: (req, res) => {
    try {
      let userID = decodeFromToken(req);

      RestaurantModel.ifDateExist(userID, (err, results) => {
        if (err) throw err;

        if (_.isEmpty(results)) {
          return res
            .status(200)
            .json({ error: true, message: "Cannot find filter data" });
        } else {
          console.log(results);
        }

        console.log(`Member ${userID}'s date is found: `, results);
        res.status(200).json({ ok: true, data: results });
      });
    } catch (error) {
      console.error("Error getting date data:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  createDate: (req, res) => {
    try {
      const { date, time } = req.body;
      let userID = decodeFromToken(req);
console.log(date, time, userID);
      RestaurantModel.ifDateExist(userID, (err, results) => {
        if (err) {
          throw err;
        }

        if (_.isEmpty(results)) {
          RestaurantModel.addDate(date, time, userID, (err, results) => {
            if (err) {
              throw err;
            }
            console.log("Date created successfully:", results);
            res.status(200).json({ ok: true });
          });
        } else {
          RestaurantModel.updateDate(date, time, userID, (err, results) => {
            if (err) {
              throw err;
            }
            console.log("Date updated successfully:", results);
            res.status(200).json({ ok: true });
          });
        }
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
  createDay: (req, res) => {
    const selectedDays = req.body.selectedDays;
    let userID = decodeFromToken(req);
    try {
      selectedDays.forEach((selectedDay) => {
        RestaurantModel.ifDayExist(userID, selectedDay, (err, results) => {
          if (err) throw err;
          if (_.isEmpty(results)) {
            RestaurantModel.addDay(userID, selectedDay, (err, result) => {
              if (err) throw err;
              console.log("Day create successfully!");
            });
          } else {
            console.log("Day exist!");
          }
        });
        res.status(200).json({ ok: true });
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getDay: (req, res) => {
    try {
      let userID = decodeFromToken(req);
      let response = [];

      RestaurantModel.getDay(userID, (err, results) => {
        if (err) {
          throw err;
        }

        if (_.isEmpty(results)) {
          return res
            .status(500)
            .json({ error: true, message: "Cannot find day data" });
        } else {
          console.log(results, "lp");
          response = results.map((row) => row.day);
        }

        console.log(`Member ${userID}'s day is found: `, results);
        res.status(200).json({ ok: true, data: response });
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
  updateDay: (req, res) => {
    try {
      const userSelectedDays = req.body.selectedDays;
      let userID = decodeFromToken(req);
      let response = [];

      RestaurantModel.getDay(userID, (err, results) => {
        if (err) {
          throw err;
        }

        if (_.isEmpty(results)) {
          userSelectedDays.forEach((selectedDay) => {
            RestaurantModel.addDay(userID, selectedDay, (err, result) => {
              if (err) {
                throw err;
              }
              console.log("Day created successfully!");
            });
          });
        } else {
          response = results.map((row) => row.day);
          let addedDays = userSelectedDays.filter(
            (day) => !response.includes(day)
          );
          let removedDays = response.filter(
            (day) => !userSelectedDays.includes(day)
          );

          addedDays.forEach((selectedDay) => {
            RestaurantModel.addDay(userID, selectedDay, (err, result) => {
              if (err) {
                throw err;
              }
              console.log("Day created successfully!");
            });
          });

          removedDays.forEach((selectedDay) => {
            RestaurantModel.removeDay(userID, selectedDay, (err, result) => {
              if (err) {
                throw err;
              }
              console.log("Day removed successfully!");
            });
          });
        }

        console.log(`Member ${userID}'s day is found: `, results);
        res.status(200).json({ ok: true });
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
  getLiked: async (req, res) => {
    try {
      // const { nickname, gender, personality, birthday } = req.body;
      let userID = decodeFromToken(req);

      let results = await new Promise((resolve, reject) => {
        PairModel.LikedByOthers(false, userID, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      if (_.isEmpty(results)) {
        results = null;
      } else {
        console.log(results);
      }

      console.log(`Member ${userID}'s liked is found: `, results);
      res.status(200).json({ ok: true, data: results });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  likeOthers: (req, res) => {
    try {
      let userID = decodeFromToken(req);

      PairModel.likeOthers(false, userID, (err, results) => {
        if (err) {
          throw err;
        }

        if (_.isEmpty(results)) {
          results = null;
        } else {
          console.log(results);
        }

        console.log(`Member ${userID}'s crush is found: `, results);
        res.status(200).json({ ok: true, data: results });
      });
    } catch (error) {
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
};

module.exports = RestaurantController;
