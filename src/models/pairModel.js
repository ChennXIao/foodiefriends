const express = require("express");
const mysql = require('mysql');
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

const PairModel={
    createPair: (USERA, USERB, restaurant, date, time, timestamp,status,callback)=>{
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
        const insertQuery = `INSERT INTO matches (USERA, USERB, restaurant, date, time, timestamp,status)
        VALUES(?, ?,?, ?,?,?,?);`
        const values = [USERA, USERB, restaurant, date, time, timestamp,status];

      connection.query(insertQuery, values, (queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },
    getPairs:(member_id, callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
        const selectQuery = `SELECT *
        FROM pairs
        INNER JOIN PROFILE ON pairs.UserA = PROFILE.member_id
        INNER JOIN restaurant ON pairs.UserA = restaurant.member_id
        WHERE pairs.UserB = ?; `
      connection.query(selectQuery, member_id, (queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },
    ifPairExist: (USERB,USERA, callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const selectQuery = `select * from matches where USERA = ? and USERB = ?`;  
      const values = [USERB,USERA]
      connection.query(selectQuery, values, (queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },

    updatePair: (USERA,USERB,status,callback)=>{
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
        const updateQuery = `UPDATE matches SET status = ? where USERA = ? and USERB = ?`;
        const values = [status,USERA,USERB];
    
        connection.query(updateQuery, values, (queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },
    ifMatched: (status,id,callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const selectQuery = `SELECT * FROM matches WHERE status = ? AND (USERA = ? OR USERB = ?);`;  
      const values = [status,id,id]
      connection.query(selectQuery, values, (queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },
    LikedByOthers: (status,id,callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const selectQuery = `SELECT * FROM matches WHERE status = ? AND USERB = ?;`;  
      const values = [status,id]
      connection.query(selectQuery, values, (queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },
    likeOthers: (status,id,callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
      const selectQuery = `SELECT * FROM matches WHERE status = ? AND USERA = ?;`;  
      const values = [status,id]
      connection.query(selectQuery, values, (queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },
    cancelDate: (id,callback) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return callback(error, null);
        }
        const deleteQuery = `delete from matches where id = ?`;    
        connection.query(deleteQuery, id,(queryError, results) => {
        connection.release();
  
        callback(queryError, results);
      });
    });
    },
    // getMatches:(member_id, callback) => {
    //   pool.getConnection((error, connection) => {
    //     if (error) {
    //       return callback(error, null);
    //     }
    //     const selectQuery = `select * from matches where status = ? and USERA = ? or USERB = ?;`;  

    //   // connection.query(selectQuery, member_id, callback);
    //   connection.query(selectQuery, [member_id,member_id], (queryError, results) => {
    //     // Release the connection back to the pool
    //     connection.release();

    //     // Forward the callback with the query results or error
    //     callback(queryError, results);
    //   });
    // });
    // },
}
module.exports = PairModel;