const UserModel = require('../models/userModel');
const RestaurantModel = require('../models/restaurantModel');
const { decodeFromToken } = require('../controllers/userController');
const ProfileModel = require('../models/profileModel');
const { faker } = require('@faker-js/faker');
const mysql = require('mysql');

const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';
const _ = require("lodash");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sharon616",
    database: 'foodiefriend',
    port: 3306,
    insecureAuth: true,
});



// // scrape restaurant data online
// const puppeteer = require('puppeteer');

// // URL of the website you want to scrape
// const url = 'https://margaret.tw/post-45282275/';

// const scrapeData = async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);
  
//     const data = await page.evaluate(() => {
//       const h5Elements = document.querySelectorAll('h5');
//       const h5Array = Array.from(h5Elements);
//       const contentArray = [];
  
//       h5Array.forEach(element => {
//         const startIndex = element.textContent.indexOf(' ');
//         const endIndex = element.textContent.indexOf('。');
//         const textContent = element.textContent.substring(6, endIndex).trim();
//         contentArray.push(textContent);
//       });
  
//       return { content: contentArray };
//     });
  
//     await browser.close();
//     return data.content;
//   };
  
//   // Function to insert data into MySQL database
//   const insertData = async (connection, sd) => {
//     const getRandomRes = () => faker.helpers.arrayElement(sd);
  
//     for (let i = 0; i < 100; i++) {
//       const userData = {
//         restaurant: getRandomRes(),
//         member_id: 102+i
//       };
  

//       // Check the count before insertion
//       const countQuery = `SELECT COUNT(*) AS data_count FROM restaurant WHERE member_id = ?`;

//       const countResults = await new Promise((resolve, reject) => {
//         connection.query(countQuery, [userData.member_id], (err, results) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(results[0].data_count);
//           }
//         });
//       });
//       if (countResults < 3) {
//       const insertQuery = `
//       INSERT INTO restaurant (name, member_id)
//       VALUES (?, ?)
//     `;
//       await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before each insertion
    
//         connection.query(insertQuery, [userData.restaurant, userData.member_id], (err, results) => {
//             if (err) {
//               console.error(`Error inserting user ${i + 1}:`, err.message);
//             } else {
//               console.log(`User ${i + 1} inserted successfully`);
//             }
      
//             if (i === 99) {
//               // Close the MySQL connection after the last insertion
//               connection.end(endErr => {
//                 if (endErr) {
//                   console.error('Error closing MySQL connection:', endErr.message);
//                 } else {
//                   console.log('MySQL connection closed');
//                 }
//               });
//             }
//           }); }

//     }
//   };
  

//   // Use Promises to control the flow
//   scrapeData()
//     .then(scrapedData => {
//       console.log('Scraped Data:', scrapedData);
//       return insertData(connection, scrapedData);
//     })
//     .catch(error => console.error('Error:', error));




// Function to generate random gender, diet, and relationship options
const getRandomGender = () => faker.helpers.arrayElement(['male', 'female', 'other']);
const getRandomDiet = () => faker.helpers.arrayElement(['vegan', 'vegetarian', 'meat-eaters', 'no preference']);
const getRandomRelationship = () => faker.helpers.arrayElement(['long term', 'short term', 'new friends', 'not sure yet']);
const getRandomLetter = () => faker.string.alpha().toUpperCase();
// Insert 100 users into the MySQL table
for (let i = 0; i < 100; i++) {
  const userData = {
    nickname: faker.internet.username(),
    gender: getRandomGender(),
    birthday: faker.date.past({ years: 30 }).toISOString().slice(0, 10),
    member_id:  faker.number.int({
        min: 102,
        max: 201,
      }),
    min:  faker.number.int({
        min: 18,
        max: 25,
      }),
    max:  faker.number.int({
        min: 25,
        max: 40,
      }),
    diet: getRandomDiet(),
    relationship: getRandomRelationship(),
    email:getRandomLetter(),
    password:getRandomLetter(),
    lat:faker.number.float({
      min: 22.836,
      max: 23.1637,
    }),
    lng:faker.number.float({
      min: 120.1625,
      max: 120.4555,
    }),

  };

  const insertQuery = `
    INSERT INTO profile (nickname, gender, birthday, member_id, diet, relationship)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const insertQuery_filter = `
  INSERT INTO filter (gender,minage,maxage,lat,lng,member_id) VALUES (?, ?,?, ?,?, ?)
  `;
  connection.query(insertQuery_filter, [
    userData.gender,
    userData.min,
    userData.max,
    userData.lat,
    userData.lng,
    userData.member_id,

  ], (err, results) => {
    if (err) {
      console.error(`Error inserting user ${i + 1}:`, err.message);
    } else {
      console.log(`User ${i + 1} inserted successfully`);
    }

    if (i === 99) {
      // Close the MySQL connection after the last insertion
      connection.end((endErr) => {
        if (endErr) {
          console.error('Error closing MySQL connection:', endErr.message);
        } else {
          console.log('MySQL connection closed');
        }
      });
    }
  });


  connection.query(insertQuery, [
    userData.nickname,
    userData.gender,
    userData.birthday,
    userData.member_id,
    userData.diet,
    userData.relationship,
  ], (err, results) => {
    if (err) {
      console.error(`Error inserting user ${i + 1}:`, err.message);
    } else {
      console.log(`User ${i + 1} inserted successfully`);
    }

    if (i === 99) {
      // Close the MySQL connection after the last insertion
      connection.end((endErr) => {
        if (endErr) {
          console.error('Error closing MySQL connection:', endErr.message);
        } else {
          console.log('MySQL connection closed');
        }
      });
    }
  });

}


// const restaurantType = 'restaurant';

// // Number of places you want to retrieve
// const numberOfPlaces = 20;

// // Construct the Places API URL with radius instead of rankby
// const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc}&radius=5000&type=${restaurantType}&key=${apiKey}`;

// // Fetch data from the API
// fetch(apiUrl)
//   .then(response => response.json())
//   .then(data => {
//     // Handle the data here
//     const places = data.results.slice(0, numberOfPlaces); // Get the first numberOfPlaces places
//     // console.log(places);

//   connection.connect();
//   places.forEach(place => {
//     const { name, vicinity,place_id,price_level } = place;
//     const query = `INSERT INTO detail (name, address,placeid,price) VALUES (?,?,?,?)`;
    
//     connection.query(query,[name, vicinity, place_id,price_level?price_level:0], (error, results) => {
//       if (error) throw error;
//       console.log(`Place '${name}' inserted with ID: ${results.insertId}`);
//     });
//   });
//   connection.end();

// }
//   )
//   .catch(error => console.error('Error fetching data:', error))



// // Function to generate random gender, diet, and relationship options
// const getRandomGender = () => faker.helpers.arrayElement(['male', 'female', 'other']);
// const getRandomDiet = () => faker.helpers.arrayElement(['vegan', 'vegetarian', 'meat-eaters', 'no preference']);
// const getRandomRelationship = () => faker.helpers.arrayElement(['long term', 'short term', 'new friends', 'not sure yet']);
// const getRandomLetter = () => faker.string.alpha().toUpperCase();
// // Insert 100 users into the MySQL table
// for (let i = 0; i < 500; i++) {
//   const userData = {
//     nickname: faker.internet.username(),
//     gender: getRandomGender(),
//     birthday: faker.date.past({ years: 30 }).toISOString().slice(0, 10),
//     member_id: 1051+i,
//     diet: getRandomDiet(),
//     relationship: getRandomRelationship(),
//     email:getRandomLetter(),
//     password:getRandomLetter(),

//   };

//   const insertQuery_profile = `
//     INSERT INTO profile (nickname, gender, birthday, member_id, diet, relationship)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;
//   const insertQuery_member = `
//   INSERT INTO member (email, password)
//   VALUES (?, ?)
// `;
// connection.query(insertQuery_member, [
//     userData.email,
//     userData.password,
//   ], (err, results) => {
//     if (err) {
//       console.error(`Error inserting user ${i + 1}:`, err.message);
//     } else {
//       console.log(`User ${i + 1} inserted successfully`);
//     }

//     if (i === 899) {
//       // Close the MySQL connection after the last insertion
//       connection.end((endErr) => {
//         if (endErr) {
//           console.error('Error closing MySQL connection:', endErr.message);
//         } else {
//           console.log('MySQL connection closed');
//         }
//       });
//     }
//   });


//   connection.query(insertQuery_profile, [
//     userData.nickname,
//     userData.gender,
//     userData.birthday,
//     userData.member_id,
//     userData.diet,
//     userData.relationship,
//   ], (err, results) => {
//     if (err) {
//       console.error(`Error inserting user ${i + 1}:`, err.message);
//     } else {
//       console.log(`User ${i + 1} inserted successfully`);
//     }

//     if (i === 499) {
//       // Close the MySQL connection after the last insertion
//       connection.end((endErr) => {
//         if (endErr) {
//           console.error('Error closing MySQL connection:', endErr.message);
//         } else {
//           console.log('MySQL connection closed');
//         }
//       });
//     }
//   });
  

// }



// // scrape restaurant data online
// const puppeteer = require('puppeteer');

// // URL of the website you want to scrape
// const url = 'https://margaret.tw/post-45282275/';

// const scrapeData = async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     page.setDefaultNavigationTimeout(120000); // Set timeout to 60 seconds

//     await page.goto(url);
  
//     const data = await page.evaluate(() => {
//       const h5Elements = document.querySelectorAll('h5');
//       const h5Array = Array.from(h5Elements);
//       const contentArray = [];
  
//       h5Array.forEach(element => {
//         const startIndex = element.textContent.indexOf(' ');
//         const endIndex = element.textContent.indexOf('。');
//         const textContent = element.textContent.substring(6, endIndex).trim();
//         contentArray.push(textContent);
//       });
  
//       return { content: contentArray };
//     });
  
//     await browser.close();
//     return data.content;
//   };
  
  // Function to insert data into MySQL database
  // const insertData = async (connection, sd) => {
    // const getRandomRes = () => faker.helpers.arrayElement(sd);
//     for(let j = 0; j < 3; j++){
//     for (let i = 0; i < 1628; i++) {
//       const userData = {
//         restaurant: faker.number.int({
//                     min: 99,
//                     max: 258,
//                   }),
//         member_id: 1+i
//       };
  

//       // // Check the count before insertion
//       // const countQuery = `SELECT COUNT(*) AS data_count FROM restaurants WHERE member_id = ?`;

//       // const countResults = await new Promise((resolve, reject) => {
//       //   connection.query(countQuery, [userData.member_id], (err, results) => {
//       //     if (err) {
//       //       reject(err);
//       //     } else {
//       //       resolve(results[0].data_count);
//       //     }
//       //   });
//       // });
//       // if (countResults < 3) {
//       const insertQuery = `
//       INSERT INTO restaurants (restaurant_id, member_id)
//       VALUES (?, ?)
//     `;
//       // await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 1 second before each insertion
    
//         connection.query(insertQuery, [userData.restaurant, userData.member_id], (err, results) => {
//             if (err) {
//               console.error(`Error inserting user ${i + 1}:`, err.message);
//             } else {
//               console.log(`User ${i + 1} inserted successfully`);
//             }
      

//           }); 

//     }
//     if (j === 1627) {
//         // Close the MySQL connection after the last insertion
//         connection.end(endErr => {
//           if (endErr) {
//             console.error('Error closing MySQL connection:', endErr.message);
//           } else {
//             console.log('MySQL connection closed');
//           }
//         });
//       }
// }
  
  

  // // Use Promises to control the flow
  // scrapeData()
  //   .then(scrapedData => {
  //     console.log('Scraped Data:', scrapedData);
  //     return insertData(connection, scrapedData);
  //   })
  //   .catch(error => console.error('Error:', error));



// console.log(sd)
// Function to generate random gender, diet, and relationship options
// const getRandomGender = () => faker.helpers.arrayElement(['male', 'female', 'other']);
// const getRandomDiet = () => faker.helpers.arrayElement(['vegan', 'vegetarian', 'meat-eaters', 'no preference']);
// const getRandomRelationship = () => faker.helpers.arrayElement(['long term', 'short term', 'new friends', 'not sure yet']);
// const getRandomLetter = () => faker.string.alpha().toUpperCase();
// // Insert 100 users into the MySQL table
// for (let i = 0; i < 100; i++) {
//   const userData = {
//     nickname: faker.internet.username(),
//     gender: getRandomGender(),
//     birthday: faker.date.past({ years: 30 }).toISOString().slice(0, 10),
//     member_id: 102 + i,
//     diet: getRandomDiet(),
//     relationship: getRandomRelationship(),
//     email:getRandomLetter(),
//     password:getRandomLetter(),

//   };

//   const insertQuery = `
//     INSERT INTO profile (nickname, gender, birthday, member_id, diet, relationship)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;


//   connection.query(insertQuery, [
//     userData.nickname,
//     userData.gender,
//     userData.birthday,
//     userData.member_id,
//     userData.diet,
//     userData.relationship,
//   ], (err, results) => {
//     if (err) {
//       console.error(`Error inserting user ${i + 1}:`, err.message);
//     } else {
//       console.log(`User ${i + 1} inserted successfully`);
//     }

//     if (i === 99) {
//       // Close the MySQL connection after the last insertion
//       connection.end((endErr) => {
//         if (endErr) {
//           console.error('Error closing MySQL connection:', endErr.message);
//         } else {
//           console.log('MySQL connection closed');
//         }
//       });
//     }
//   });

// }

// const getRandomDay = () => faker.helpers.arrayElement([ 'Tuesday', 'Wednesday', 'Saturday', 'Sunday', 'Thursday', 'Monday', 'Friday']);

// const getRandomGender = () => faker.helpers.arrayElement(['male', 'female', 'other']);
// const getRandomDiet = () => faker.helpers.arrayElement(['vegan', 'vegetarian', 'meat-eaters', 'no preference']);
// const getRandomRelationship = () => faker.helpers.arrayElement(['long term', 'short term', 'new friends', 'not sure yet']);
// const getRandomLetter = () => faker.string.alpha().toUpperCase();
// // Insert 100 users into the MySQL table



// const util = require('util');
// const connectionQuery = util.promisify(connection.query).bind(connection);

// // ... (your other code)
// const insertQuery_day = `
// INSERT INTO day (member_id, day) VALUES (?, ?)
// `;
// const insertQuery_filter = `
// INSERT INTO filter (gender,minage,maxage,lat,lng,member_id) VALUES (?, ?,?, ?,?, ?)
// `;
// const insertQuery_date = `
// INSERT INTO date (date,time,member_id) VALUES (?,?, ?)
// `;
// const selectQuery_day = `
// select * from day where member_id = ? and day=?;
// `;

// async function checkAndInsertData(userData) {
//   try {
//     const results = await connectionQuery(selectQuery_day, [userData.member_id, userData.day]);
//     console.log(results);

//     if (results.length === 0) {
//       await connectionQuery(insertQuery_day, [userData.member_id, userData.day]);
//       console.log('Data inserted successfully');
//     } else {
//       console.log('Data already exists');
//     }
//   } catch (err) {
//     console.error('Error:', err.message);
//   }
// }

// async function insertUserData() {
//   for (let i = 0; i < 1500; i++) {
//     const userData = {
//       nickname: faker.internet.username(),
//       gender: getRandomGender(),
//       day: getRandomDay(),
  
//       birthday: faker.date.past({ years: 30 }).toISOString().slice(0, 10),
//       member_id:0 + i,
//       min:  faker.number.int({
//           min: 0,
//           max: 25,
//         }),
//       max:  faker.number.int({
//           min: 25,
//           max: 40,
//         }),
//       diet: getRandomDiet(),
//       relationship: getRandomRelationship(),
//       email:getRandomLetter(),
//       password:getRandomLetter(),
//       lat:faker.number.float({
//         min: 22.836,
//         max: 23.1637,
//       }),
//       lng:faker.number.float({
//         min: 120.1625,
//         max: 120.4555,
//       }),
//       time: faker.number.int({
//           min: 10,
//           max: 16,
//         }) +":00",
//         date: "2023-12-0"+faker.number.int({
//           min: 1,
//           max: 5,
//         }),
  
//     };

//     await checkAndInsertData(userData);
//   }

//   // Close the MySQL connection after all insertions
//   await connection.end();
//   console.log('MySQL connection closed');
// }

// // Call the function to insert user data
// insertUserData();


// for (let i = 0; i < 1500; i++) {
//   const userData = {
//     nickname: faker.internet.username(),
//     gender: getRandomGender(),
//     day: getRandomDay(),

//     birthday: faker.date.past({ years: 30 }).toISOString().slice(0, 10),
//     member_id:0 + i,
//     min:  faker.number.int({
//         min: 0,
//         max: 25,
//       }),
//     max:  faker.number.int({
//         min: 25,
//         max: 40,
//       }),
//     diet: getRandomDiet(),
//     relationship: getRandomRelationship(),
//     email:getRandomLetter(),
//     password:getRandomLetter(),
//     lat:faker.number.float({
//       min: 22.836,
//       max: 23.1637,
//     }),
//     lng:faker.number.float({
//       min: 120.1625,
//       max: 120.4555,
//     }),
//     time: faker.number.int({
//         min: 10,
//         max: 16,
//       }) +":00",
//       date: "2023-12-0"+faker.number.int({
//         min: 1,
//         max: 5,
//       }),

//   };

 



//   connection.query(insertQuery_day, [
//     userData.member_id, 
//     userData.day,
//   ], (err, results) => {
//     if (err) {
//       console.error(`Error inserting user ${i + 1}:`, err.message);
//     } else {
//       console.log(`User ${i + 1} inserted successfully`);
//     }

//     if (i === 499) {
//       // Close the MySQL connection after the last insertion
//       connection.end((endErr) => {
//         if (endErr) {
//           console.error('Error closing MySQL connection:', endErr.message);
//         } else {
//           console.log('MySQL connection closed');
//         }
//       });
//     }
//   });

  //   connection.query(insertQuery_date, [
  //   userData.date.toString(),
  //   userData.time,
  //   userData.member_id,

  // ], (err, results) => {
  //   if (err) {
  //     console.error(`Error inserting user ${i + 1}:`, err.message);
  //   } else {
  //     console.log(`User ${i + 1} inserted successfully`);
  //   }

  //   if (i === 499) {
  //     // Close the MySQL connection after the last insertion
  //     connection.end((endErr) => {
  //       if (endErr) {
  //         console.error('Error closing MySQL connection:', endErr.message);
  //       } else {
  //         console.log('MySQL connection closed');
  //       }
  //     });
  //   }
  // });

  // connection.query(insertQuery_filter, [
  //   userData.gender,
  //   userData.min,
  //   userData.max,
  //   userData.lat,
  //   userData.lng,
  //   userData.member_id,

  // ], (err, results) => {
  //   if (err) {
  //     console.error(`Error inserting user ${i + 1}:`, err.message);
  //   } else {
  //     console.log(`User ${i + 1} inserted successfully`);
  //   }

  //   if (i === 499) {
  //     // Close the MySQL connection after the last insertion
  //     connection.end((endErr) => {
  //       if (endErr) {
  //         console.error('Error closing MySQL connection:', endErr.message);
  //       } else {
  //         console.log('MySQL connection closed');
  //       }
  //     });
  //   }
  // });


// }
