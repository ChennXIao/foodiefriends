const UserModel = require("../models/userModel");
const RestaurantModel = require("../models/restaurantModel");
const { decodeFromToken } = require("../controllers/userController");
const ProfileModel = require("../models/profileModel");
const PairModel = require("../models/pairModel");
const RestaurantController = require("../controllers/restaurantController");

const mysql = require("mysql");

const _ = require("lodash");
const aws = require("aws-sdk");
var similarity = require("compute-cosine-similarity");

require("dotenv").config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const connection = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: "foodiefriend",
  port: 3306, // MySQL default port
});

const ProfileController = {
  createProfile: async (req, res) => {
    try {
      const { nickname, gender, birthday, relationshipGoal, diet } = req.body;
      console.log(req.body);
      let userID = decodeFromToken(req);

      await new Promise((resolve, reject) => {
        ProfileModel.newProfile(
          nickname,
          gender,
          birthday,
          relationshipGoal,
          diet,
          userID,
          (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          }
        );
      });

      console.log("Profile created successfully");
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  checkProfile: async (req, res) => {
    try {
      let userID = decodeFromToken(req);
      const profileQueryId = req.params.id;

      const results = await new Promise((resolve, reject) => {
        ProfileModel.ifProfileExist(profileQueryId, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      if (_.isEmpty(results)) {
        return res.status(200).json({ message: "Cannot find any" });
      }

      console.log(`Member ${profileQueryId}'s profile is found: `, results);
      res.status(200).json({ ok: true, data: results });
    } catch (error) {
      console.error("Error checking profile:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  getCurrentUserProfileAndFilter: async (req, res) => {
    try {
      let userID = decodeFromToken(req);
      let hasMatched = [];

      let results = await new Promise((resolve, reject) => {
        ProfileModel.CurrentUserProfileAndFilter(userID, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (_.isEmpty(results)) {
        return res.status(200).json({ message: "cannot find any" });
      }
      try {
        let MatchBefore = await new Promise((resolve, reject) => {
          PairModel.ifMatched(false, userID, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        if (_.isEmpty(MatchBefore)) {
        } else {
          MatchBefore.forEach((e) => {
            if (e.USERA == userID) {
              hasMatched.push(e.USERB);
            } else {
              hasMatched.push(e.USERA);
            }
          });
        }
      } catch (error) {
        // Handle the error
      }

      //current user's profile and filter
      let { minage, maxage, gender, diet, relationship } = results[0];
      console.log(minage, maxage, gender, diet, relationship);

      let matchResults = await new Promise((resolve, reject) => {
        ProfileModel.FilteringAll(
          minage,
          maxage,
          gender,
          diet,
          relationship,
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });

      if (_.isEmpty(matchResults)) {
        return res.status(200).json({ message: "cannot find any" });
      }

      let filteredMatchResults = matchResults.filter(
        (result) => !hasMatched.includes(result.member_id)
      );

      let dateResults = await new Promise((resolve, reject) => {
        RestaurantModel.ifDateExist(userID, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      const dateObject = new Date(dateResults[0].date);
      const dayOfWeek = dateObject.toLocaleDateString("en-US", {
        weekday: "long",
      });

      //find day matched others
      let dateMatchedResults = await new Promise((resolve, reject) => {
        RestaurantModel.ifDayMatch(dayOfWeek, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      const memberIdsArray = dateMatchedResults.map((row) => row.member_id);

      let currentUserPriceLevel = [];
      let response = { data: [] };
      let currentUserResponse = { data: [] };
      let currentUserlikedResults = await new Promise((resolve, reject) => {
        RestaurantModel.LikedRestaurant(userID, (err, dresults) => {
          if (err) reject(err);
          else resolve(dresults);
        });
      });
      response.data.push({ member: userID, name: [] });
      console.log(currentUserlikedResults, "current");

      let likedResults = await new Promise((resolve, reject) => {
        RestaurantModel.LikedRestaurant(userID, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      if (!_.isEmpty(likedResults)) {
        likedResults.forEach((element) => {
          console.log(element.price);
          if (element.price > 0) {
            currentUserPriceLevel.push(element.price);
          }
          const memberIndex = response.data.findIndex(
            (member) => member.member === element.member_id
          );
          if (memberIndex === -1) {
            response.data.push({
              member: element.member_id,
              name: [element.id],
            });
          } else {
            response.data[memberIndex].name.push(element.id);
          }
        });
      }
      let currentUserRestaurant;
      currentUserRestaurant = response.data[0].name;
      console.log(currentUserRestaurant);

      //filter matched others
      for (const e of filteredMatchResults) {
        response.data.push({ member: e.member_id, name: [] });

        let likedResults = await new Promise((resolve, reject) => {
          RestaurantModel.LikedRestaurant(e.member_id, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        if (!_.isEmpty(likedResults)) {
          likedResults.forEach((element) => {
            console.log(element, "-=-=-=-=");

            const memberIndex = response.data.findIndex(
              (member) => member.member === element.member_id
            );
            if (memberIndex === -1) {
              response.data.push({
                member: element.member_id,
                name: [element.id],
              });
            } else {
              response.data[memberIndex].name.push(element.id);
            }
          });
        }
      }
      //remove others who do not have restaurant data
      response.data = response.data.filter((item) => item.name.length > 0);
      //get others whose day is matched
      response.data = response.data.filter((entry) =>
        memberIdsArray.includes(entry.member)
      );

      // Integrate all current restaurants
      const restaurants = Array.from(
        new Set(response.data.flatMap((user) => user.name))
      );

      let userItemMatrix = response.data.map((user) => {
        const userRow = restaurants.map((restaurant) =>
          user.name.includes(restaurant) ? 1 : 0
        );

        return userRow;
      });

      console.log(userItemMatrix);
      let similarityArr = [];
      let mostSimilarUsers = [];
      userItemMatrix.forEach((e, index) => {
        var s = similarity(userItemMatrix[0], e);
        similarityArr.push([index, s]);
        // console.log(s)
      });
      const sortedMatrix = similarityArr.sort((a, b) => b[1] - a[1]);
      console.log(sortedMatrix);
      sortedMatrix.slice(0, 100).forEach((e, index) => {
        let ord = e[0];
        mostSimilarUsers.push(response.data[ord]);
      });
      console.log(mostSimilarUsers, "iuhihuigo8tg8");
      //remove user self
      // let currentuser =  mostSimilarUsers.splice(0,1)
      // console.log(currentuser,"hu")

      const recommendedRestaurants = [];
      let response2 = { data: [] };

      // Create an array to store all promises
      const promises = mostSimilarUsers.map(async (perUser) => {
        let memberIndex = response2.data.findIndex(
          (member) => member.member === perUser.member
        );

        if (memberIndex === -1) {
          response2.data.push({
            member: perUser.member,
            name: [],
            profile: {},
          });
          memberIndex = response2.data.length - 1;
        }

        // filter out others' restaurant if the current user has them
        for (const restaurant of perUser.name) {
          if (!currentUserRestaurant.includes(restaurant)) {
            try {
              const restaurantInfo = await new Promise((resolve, reject) => {
                RestaurantModel.getRestaurantFromId(
                  restaurant,
                  (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                  }
                );
              });

              response2.data[memberIndex].name.push(restaurantInfo[0]);
            } catch (error) {
              console.error("Error fetching restaurant info:", error);
            }
          }
        }

        // in the perfect match case, randomly pick one of the other's restaurants
        if (_.isEmpty(response2.data[memberIndex].name)) {
          const restaurantIndex = response.data.findIndex(
            (member) => member.member === perUser.member
          );
          const randomPick = response.data[restaurantIndex].name[0];

          // const numericData = currentUserPriceLevel.map(Number);
          // const averagePrice = numericData.reduce((sum, value) => sum + value, 0)/ numericData.length;
          // console.log(averagePrice)
          // let priceArray=[];
          // console.log(response.data[restaurantIndex])
          // response.data[restaurantIndex].name.forEach(
          //   e =>{
          //     priceArray.push(e.price)
          //   }
          // )
          // console.log(priceArray)
          // const closestNumber = priceArray.reduce((closest, current) => (
          //   Math.abs(averagePrice - current) < Math.abs(averagePrice - closest) ? current : closest
          // ), priceArray[0]);

          // const pickByPrice = response.data[restaurantIndex].name.filter(item => item.price === closestNumber);
          // console.log(pickByPrice,closestNumber)

          try {
            const randomRestaurantInfo = await new Promise(
              (resolve, reject) => {
                RestaurantModel.getRestaurantFromId(
                  randomPick,
                  (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                  }
                );
              }
            );

            response2.data[memberIndex].name.push(randomRestaurantInfo[0]);
          } catch (error) {
            console.error("Error fetching random restaurant info:", error);
          }
        }

        // get the ultimate rendered user's profile
        try {
          const results = await new Promise((resolve, reject) => {
            ProfileModel.ifProfileExist(perUser.member, (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });

          if (!_.isEmpty(results)) {
            const birthdateString = results[0].birthday;
            const birthdate = new Date(birthdateString);
            const currentDate = new Date();
            const ageInMilliseconds = currentDate - birthdate;
            const ageInYears = Math.floor(
              ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000)
            );

            response2.data[memberIndex].profile.name = results[0].nickname;
            response2.data[memberIndex].profile.gender = results[0].gender;
            response2.data[memberIndex].profile.age = ageInYears;
            response2.data[memberIndex].profile.diet = results[0].diet;
            response2.data[memberIndex].profile.relationship =
              results[0].relationship;
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      });

      Promise.all(promises)
        .then(() => {
          console.log(response2);

          return res.status(200).json(response2);
        })
        .catch((error) => {
          console.error("Error:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  },
  updateProfile: async (req, res) => {
    const { nickname, relationshipGoal, diet } = req.body;
    let userID = decodeFromToken(req);

    try {
      await new Promise((resolve, reject) => {
        ProfileModel.updateProfile(
          nickname,
          relationshipGoal,
          diet,
          userID,
          (err, results) => {
            if (err) {
              console.error("Error updating profile:", err);
              reject(err);
            } else {
              console.log("Profile updated successfully:", results);
              resolve(results);
            }
          }
        );
      });
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
};

module.exports = ProfileController;
