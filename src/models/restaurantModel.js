const express = require("express");
const mysql = require('mysql2');
const path = require("path");
const port = 80;
const app = express();
const bodyParser = require('body-parser');
const _ = require("lodash");
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');

require('dotenv').config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const awsID = process.env.AWS_KEY_ID;
const awsKEY = process.env.AWS_SECRET_KEY;
const awsRegion = process.env.AWS_REGION;

// Create a connection pool
const pool = require('./connectDb');

const RestaurantModel = {
  getAllRestaurant: (callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT * FROM restaurant;`
      connection.query(selectQuery, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  getUserRestaurant: (id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `select member_id,restaurant_info.id,name,address,placeid from restaurant_info inner join liked_restaurant ON restaurant_info.id =liked_restaurant.restaurant_id where member_id = ?;`
      connection.query(selectQuery, id, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },


  getRestaurantFromId: (id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT * FROM restaurant_info where id = ?;`
      connection.query(selectQuery, id, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  addDay: (id, selectedDay, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const insertQuery = 'INSERT INTO day (member_id, day) VALUES (?, ?)';
      const values = [id, selectedDay];

      connection.query(insertQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  getDay: (id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = 'select * from day where member_id = ?;';

      connection.query(selectQuery, id, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  ifDayExist: (id, day, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = 'select day from day where member_id = ? and day=?;';
      const values = [id, day];

      connection.query(selectQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  removeDay: (id, day, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const deleteQuery = 'delete from day where member_id = ? and day=?;';
      const values = [id, day];

      connection.query(deleteQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  ifDayMatch: (day, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT DISTINCT member_id AS member_id FROM day WHERE day = ?;`;
      connection.query(selectQuery, day, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  // addRestaurant: (id, name, callback) => {
  //   pool.getConnection((error, connection) => {
  //     if (error) {
  //       return callback(error, null);
  //     }
  //     const insertQuery = `INSERT INTO liked_restaurant (member_id,name) VALUES (?, ?)`;
  //     const values = [id, name];

  //     connection.query(insertQuery, values, (queryError, results) => {
  //       connection.release();

  //       callback(queryError, results);
  //     });
  //   });
  // },
  addRestaurants: (restaurantInfo, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const insertQuery = `INSERT IGNORE INTO restaurant_info(name, address, price, placeid)
        VALUES (?, ?,?, ?)`;

      connection.query(insertQuery, restaurantInfo, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  ifRestaurantExist: (place_id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT id FROM restaurant_info WHERE placeid = ?`;

      connection.query(selectQuery, place_id, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  addUserRestaurantId: (userId, restaurant_id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const insertQuery = `INSERT INTO liked_restaurant(member_id,restaurant_id)VALUES (?, ?)`;
      const values = [userId, restaurant_id];

      connection.query(insertQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  updateUserRestaurantId: (userId, modifiedRestaurant_id, updatedRestaurant_id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const updateQuery = `UPDATE liked_restaurant SET restaurant_id = ? where member_id = ? and restaurant_id = ?`;
      const values = [updatedRestaurant_id, userId, modifiedRestaurant_id];

      connection.query(updateQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  filterData: (callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery =
        `SELECT *
        FROM profile
        INNER JOIN restaurant
        ON profile.member_id=restaurant.member_id;`
      connection.query(selectQuery, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  ifDateMatch: (date, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `select member_id from date where date = ?`;
      connection.query(selectQuery, date, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },


  ifFilterExist: (member_id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `select * from filter where member_id = ?`;
      connection.query(selectQuery, member_id, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  ifDateExist: (member_id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `select * from date where member_id = ?`;
      connection.query(selectQuery, member_id, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  addFilter: (gender, minage, maxage, lat, lng, id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const insertQuery = `INSERT INTO filter (gender,minage,maxage,lat,lng,member_id) VALUES (?, ?,?, ?,?, ?)`;
      const values = [gender, minage, maxage, lat, lng, id];

      connection.query(insertQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  updateFilter: (gender, minage, maxage, lat, lng, id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const updateQuery = `UPDATE filter SET gender = ?, minage = ?, maxage = ?, lat = ?, lng = ? where member_id = ?`;
      const values = [gender, minage, maxage, lat, lng, id];

      connection.query(updateQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  updateDate: (date, time, id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const updateQuery = `UPDATE date SET date = ?, time = ? where member_id = ?`;
      const values = [date, time, id];

      connection.query(updateQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  updateRestaurant: (original, modify, id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const updateQuery = `UPDATE liked_restaurant SET name = ? where name = ? and member_id = ?;`;
      const values = [modify, original, id];

      connection.query(updateQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  addDate: (date, time, id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const insertQuery = `INSERT INTO date (date,time,member_id) VALUES (?,?, ?)`;
      const values = [date, time, id];

      connection.query(insertQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

  LikedRestaurant: (member_id, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = ` select member_id,restaurant_info.id,price from restaurant_info inner join liked_restaurant ON restaurant_info.id =liked_restaurant.restaurant_id where member_id = ?`;

      connection.query(selectQuery, member_id, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

}

module.exports = RestaurantModel;




