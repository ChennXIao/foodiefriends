const express = require("express");
const mysql = require('mysql2');
const path = require("path");
const port = 80;
const app = express();
const bodyParser = require('body-parser');
const _ = require("lodash");
const jwt = require('jsonwebtoken');

require('dotenv').config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// Create a connection pool
const pool = require('./connectDb');

const UserModel = {

  newUser: (email, password, callback) => {

    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const insertQuery = `INSERT INTO member (email, password) VALUES (?, ?)`;
      const values = [email, password];
      console.log('run here33r23r2r32');

      connection.query(insertQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },
  ifUserExist: (email, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT * FROM member WHERE email = ? ;`
      connection.query(selectQuery, email, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },


  findByEmailAndPassword: (email, password, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        return callback(error, null);
      }
      const selectQuery = `SELECT * FROM member WHERE email = ? AND password = ?`;
      const values = [email, password];

      connection.query(selectQuery, values, (queryError, results) => {
        connection.release();

        callback(queryError, results);
      });
    });
  },

};

module.exports = UserModel;
