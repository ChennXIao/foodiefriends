let token = localStorage.getItem("token")
  ? localStorage.getItem("token")
  : document.cookie.replace(
      /(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
let userId;
let cardIndex;
const buttons = document.querySelectorAll(".nav-link");
const defaultClicked = document.querySelector("#v-pills-match-results-tab");
let backToMatchBtn = document.querySelector("#backToMatchBtn");
const socket = io("http://localhost:8000", {
  transports: ["websocket"],
  allowEIO3: true,
});
let reSelectBtn;
let cardContainer = document.querySelector("#sent-to-me_result");
let cardData;

document.addEventListener("DOMContentLoaded", async () => {
  await login_check();
  console.log(userId);
  if (!userId) {
    window.location.href = "/";
  }
});

//match modal處理
document
  .getElementById("its_a_match_btn")
  .addEventListener("click", function () {
    var myModal = new bootstrap.Modal(document.getElementById("matchModal"));
    myModal.show();
  });

document
  .getElementById("keepmatchButton")
  .addEventListener("click", function () {
    window.location.href = "/my-matches";
    var myModal = new bootstrap.Modal(document.getElementById("matchModal"));
    myModal.hide();
  });

document.addEventListener("DOMContentLoaded", async () => {
  let whoUserLikes = await likeOthers();
  console.log(whoUserLikes);
  document.querySelector("#i-sent_result").innerHTML = whoUserLikes.data[0].id;
});

document.addEventListener("DOMContentLoaded", async () => {
  await displayData();

  cardIndex = 0;
  renderCard(0);
});

// defaultClicked.click()
buttons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const clickedButton = event.currentTarget.id;
    if (clickedButton == "v-pills-sent-to-me-tab") {
      //
    } else if (clickedButton == "v-pills-i-sent-tab") {
      //
    } else {
      window.location.href = window.location.href;
    }
  });
});

backToMatchBtn.addEventListener("click", () => {
  window.location.href = "/match";
});

this.id = 0;

async function login_check() {
  if (!token) {
    return false;
  } else {
    try {
      let response = await fetch("/api/user/auth", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let result = await response.json();
      userId = result.id;
      return result.id;
    } catch (error) {}
  }
}

async function getMatches() {
  let match_containter = document.querySelector(".match_results");
  let response = await fetch("/api/matches", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let result = await response.json();
  let data = result.data;
  if (data == null) {
    document.querySelector(
      ".match_results"
    ).innerHTML = `<h5>No matches so far.</h5>`;
  } else {
    //render restaurant info into page
    for (let i = 0; i < data.length; i++) {
      let block = document.createElement("div");
      block.className = "match_notification";
      match_containter.appendChild(block);
      block.innerHTML = `<i class='far fa-user-circle' id="msg_icon"></i><p id="matches_msg">You have a date <span id="date_member">${data[i].user}</span> on ${data[i].date.slice(0, 10)} ${data[i].time}<span style="display:none">,${data[i].restaurant},</span><span style="display:none">${data[i].id}</span></p>`;

      const matchesMsg = document.querySelectorAll(".match_notification");

      matchesMsg.forEach((e) => {
        e.addEventListener("mousedown", function () {
          // Change the background color on mousedown
          this.style.backgroundColor = "#F3F3F3"; // Change to your desired color
          this.style.color = "black";
          renderMatchInfo(e.textContent);
        });

        e.addEventListener("mouseup", function () {
          // Change the text color on mouseup
          this.style.color = "white"; // Change to your desired color

          // Set a timeout to revert the styles after a short delay
          setTimeout(() => {
            this.style.backgroundColor = "white";
            this.style.color = "black";
          }, 300); // Adjust the delay (in milliseconds) based on your transition duration
        });
      });
    }
  }
}

getMatches();
async function renderMatchInfo(date) {
  const matchInfoRegex =
    /You have a date (\d+) on (\d{4}-\d{2}-\d{2} (.+):(.+)(.+)),(.+),(.+)/;

  const matchInfo = date.match(matchInfoRegex);
  console.log(matchInfo);
  // let currentCard = cardData[cardIndex];
  let profileResponse = await fetch(`/api/profile/${matchInfo[1]}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  let restaurantResponse = await fetch(`/api/restaurants/${matchInfo[6]}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let UserBrestaurantResponse = await fetch(
    `/api/restaurants/user/${matchInfo[1]}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let result = await profileResponse.json();
  let useraProfileData = result.data[0];

  let UserBrestaurantResult = await UserBrestaurantResponse.json();
  let UserBrestaurantData = UserBrestaurantResult.data;

  let restaurantResult = await restaurantResponse.json();
  let useraRestaurantData = restaurantResult.data[0];

  document.querySelector(".match_results").innerHTML = `<div class="container">

        <div class="card invitation-card">
          <div class="card-body" id="match_card">
            <h4 class="card-title">You have a date with <span class="w3-btn w3-hover-opacity" id="trial"><b>${useraProfileData.nickname}</b></span>!</h4>
            <p class="card-text">Make sure you are available at the time below</p>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>Date:</strong> ${matchInfo[2]}</li>
              <li class="list-group-item w3-tooltip"><strong>Location: </strong><b>${useraRestaurantData[0].name}</b> <span class="w3-text w3-tag" id="match_result_card_text"><h5>How to get there: </h5><a href="https://www.google.com/maps/place/?q=place_id:${useraRestaurantData[0].placeid}">${useraRestaurantData[0].address}<i class='fa fa-link'></i></a></span></li>
            </ul>
            <h5>Please cancel the date if you are not able to be there.</h5>
            <button class="btn btn-info mt-3" id="back_to_results">back</button>
            <button class="btn btn-danger mt-3" id="cancel">Cancel the date</button>

          </div>

    </div>
  </div>

    `;
  let back_to_resultsBtn = document.querySelector("#back_to_results");
  if (back_to_resultsBtn) {
    back_to_resultsBtn.addEventListener("click", (event) => {
      window.location.href = window.location.href;
    });
  }
  let previewBtn = document.querySelector("#trial");
  if (previewBtn) {
    previewBtn.addEventListener("click", async function () {
      var myModal = new bootstrap.Modal(
        document.getElementById("staticBackdrop")
      );
      document.querySelector(".modal-body").innerHTML = getCardHTML(
        useraProfileData,
        useraRestaurantData,
        UserBrestaurantData
      );

      myModal.show();
    });
  }

  let cancelBtn = document.querySelector("#cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", async function () {
      try {
        let response = await fetch(`/api/matches/${matchInfo[7]}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let result = await response.json();
        if (result.ok) {
          setTimeout(() => {
            window.location.href = window.location.href;
          }, 2000);
          showToast("Cancel successfully!", true);
        }
      } catch (error) {
        // console.error("Error:", error);
      }
    });
  }
}

function showToast(msg, color) {
  iziToast.show({
    message: msg,
    messageColor: "white",
    messageSize: "50px",
    messageLineHeight: "50px",
    timeout: 2000,
    position: "topRight",
    backgroundColor: color ? "#C1F2B0" : "#DC8686",
    theme: "light",
    color: "#FBF6EE",
    // imageWidth: 30,
    icon: color ? "fa fa-check-circle" : "fa fa-close",
    iconColor: "white", // Font Awesome icon class    animateInside: true,
    animateOutside: false,
    // Other options...
  });
  // Add a custom class to the iziToast message container
  const toastContainer = document.querySelector(
    ".iziToast-container .iziToast-message"
  );
  toastContainer.classList.add("custom-message-style");
}

async function getLiked() {
  try {
    let response = await fetch("/api/likes/liked", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let result = await response.json();
    if (result.error) {
      return result;
    }
    return result;
  } catch (error) {
    // console.error("Error:", error);
  }
}

async function likeOthers() {
  try {
    let response = await fetch("/api/likes/others", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let result = await response.json();
    return result;
  } catch (error) {
  }
}

async function displayData() {
  try {
    let whoLikesUser = await getLiked();
    if (whoLikesUser.error) {
    } else {
      cardData = whoLikesUser.data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function renderCard(cardIndex) {
  // Check if there are more cards to render
  if (cardData != null && cardIndex < cardData.length) {
    let currentCard = cardData[cardIndex];
    let profileResponse = await fetch(
      `/api/profile/${cardData[cardIndex].USERA}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let restaurantResponse = await fetch(
      `/api/restaurants/user/${cardData[cardIndex].USERA}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let dateRestaurantResponse = await fetch(
      `/api/restaurants/${cardData[cardIndex].restaurant}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let result = await profileResponse.json();
    let useraProfileData = result.data[0];
    let restaurantResult = await restaurantResponse.json();
    let useraRestaurantData = restaurantResult.data;
    let dateRestaurantResult = await dateRestaurantResponse.json();
    let dateRestaurantData = dateRestaurantResult.data[0];

    cardContainer.innerHTML = getCard(
      currentCard,
      useraProfileData,
      useraRestaurantData,
      dateRestaurantData
    );
  } else {
    cardContainer.innerHTML = NoCardHTML();
  }
}

function NoCardHTML() {
  setTimeout(() => {
    // This code will be executed after the timeout
    let reSelectBtn = document.querySelector("#reselect_btn");
    if (reSelectBtn) {
      reSelectBtn.addEventListener("click", () => {
        window.location.href = "/match";
      });
    }
  });

  return `<h3>No invitation.</h3>
            <h5>Lead the way, be the first to invite and spark a memorable date.</h5>
            <button type="button" class="btn btn-danger" id="reselect_btn">
              ok
            </button>`;
}

function getCard(
  card,
  useraProfileData,
  useraRestaurantData,
  dateRestaurantData
) {
  const birthdateString = useraProfileData.birthday;
  const birthdate = new Date(birthdateString);
  const currentDate = new Date();

  const ageInMilliseconds = currentDate - birthdate;
  const ageInYears = Math.floor(
    ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000)
  );
  let userRestaurant = [];
  useraRestaurantData.forEach((e) => {
    userRestaurant.push(e.name);
  });

  return `
    <div id="match_hint_text">${useraProfileData.nickname} invites you to eat out at ${card.time} !!


    </div>
    <div class="card tinder-card" id="swipeCard">
      <img src="https://placekitten.com/300/200" class="card-img-top" id="sent-to-card-img" alt="${card.restaurant}">
      <div class="card-body" id="sent-to-card-body">
        <div id="scrollContainer" data-spy="scroll" data-target="#swipeCard">
          <h4 class="card-title">${dateRestaurantData[0].name}</h4>
          <a href="https://www.google.com/maps/place/?q=place_id:${dateRestaurantData[0].placeid}"><p>${dateRestaurantData[0].address}</p></a>
          <h4> ${useraProfileData.nickname}, ${ageInYears} </h4>
          <hr>
          <h4 id="scrollspyHeading2">About me</h4>
          <br>

          <h5>I  also like </h5>
          <h5>${userRestaurant} </h5>
          <h5>I am finding a :
          <h6>${useraProfileData.relationship} relationship.</h6>
          <h5>I am a ${useraProfileData.diet}.</h5>
          <hr>
          <h5>Swipe right and have a date with me!!</h5>
        </div>
        <button class="btn btn-danger" id="dislikeBtn" onclick="return dislike()">REJECT</button>
        <button class="btn btn-success"id="likeBtn" member_id=${card.USERA} onclick="return like(${card.id})">ACCEPT</button>
      </div>
    `;
}

function getCardHTML(card, restaurant, userAOtherRestaurant) {
  const birthdateString = card.birthday;
  const birthdate = new Date(birthdateString);
  const currentDate = new Date();

  const ageInMilliseconds = currentDate - birthdate;
  const ageInYears = Math.floor(
    ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000)
  );
  let userRestaurant = [];
  userAOtherRestaurant.forEach((e) => {
    userRestaurant.push(e.name);
  });
  return `
  <div id="scrollContainer" data-spy="scroll" data-target="#swipeCard">
  <h4 class="card-title"></h4>
  <h4> ${card.nickname}, ${ageInYears} </h4>
  <hr>
  <h4 id="scrollspyHeading2">About me</h4>
  <br>
  <h5>I  also like </h5>
  <h5>${userRestaurant}</h5>
  <h5>I am finding a :
  <h6>${card.relationship} relationship.</h6>
  <h5>I am a ${card.diet}.</h5>
  <hr>
  <h5>Swipe right and have a date with me!!</h5>
</div>

  `;
}

function dislike() {
  var card = document.getElementById("swipeCard");
  card.classList.add("swipe-left");
  setTimeout(function () {
    card.classList.remove("swipe-left");
  }, 300);
  this.id++;
  setTimeout(function () {
    renderCard(this.id);
  }, 250);
}

async function like(id) {
  let add_restaurant = [];
  add_restaurant.push(cardData[this.id].restaurant);
  let response = await fetch("/api/restaurants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: add_restaurant }),
  });
  let result = await response.json();
  sendLike(cardData[this.id].USERA);

  let card = document.getElementById("swipeCard");
  card.classList.add("swipe-right");
  setTimeout(function () {
    card.classList.remove("swipe-right");
  }, 300);

  // 為展示remove
  let match_response = await fetch("/api/matches", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ USERA: cardData[this.id].USERA, USERB: userId }),
  });
  let match_result = await match_response.json();
  if (match_result.ok) {
    console.log(cardData[this.id].USERA);
    sendLike(cardData[this.id].USERA);
  }

  this.id++;
  setTimeout(function () {
    renderCard(this.id);
  }, 250);
}

function connect() {
  socket.on("connect", async () => {
    userId = await login_check();
    console.log(socket.id);
    socket.emit("setUserId", userId);
  });
}
connect();

function getNotified() {
  socket.on("notification", (message) => {
    document.getElementById("its_a_match_btn").click();
  });
}
getNotified();
async function sendLike(likedUserId) {
  socket.emit("setUserId", userId);
  socket.emit("like", likedUserId);
}
