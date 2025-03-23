let token = localStorage.getItem("token")
  ? localStorage.getItem("token")
  : document.cookie.replace(
    /(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
let userId;
let cardContainer = document.getElementById("cardContainer");
let cardData;
let cardIndex;
let reSelectBtn;
let reSelectRestaurantBtn;
let currentLat, currentLng;
let selectedTime, selectedDate;
let currentUserFilter;
let currentUserDate;
let gender, minAge, maxAge;
const socket = io("http://localhost:8000", {
  transports: ["websocket"],
  allowEIO3: true,
});

const currentDate = new Date();
const startOfWeek = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate() + 1
);
const endOfWeek = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate() + 6
);

const filterModal = new bootstrap.Modal(document.getElementById("filterModal"));
const customRangeSlider = new Slider("#customRange", {
  tooltip: "always",
  highlight: true,
  formatter: function (value) {
    return value[0] + " - " + value[1];
  },
});

customRangeSlider.on("slide", function (sliderValue) {
  document.getElementById("selectedRange").innerText =
    sliderValue[0] + " - " + sliderValue[1];
  minAge = sliderValue[0];
  maxAge = sliderValue[1];
});

document.addEventListener("DOMContentLoaded", () => {
  const reSelectRestaurantBtn = document.querySelector(
    "#restaurant_reselect_btn"
  );

  if (reSelectRestaurantBtn) {
    reSelectRestaurantBtn.addEventListener("clickr", () => {
      try {
        localStorage.setItem("activeTab", "restaurant");
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      setTimeout(() => { }, 1000);
    });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  let currentUserFilter = await checkFilter();
  checkDate().then((result) => {
    currentUserDate = result[0];
    document.getElementById("datePicker").value = currentUserDate.date;
    document.getElementById("timePicker").value = currentUserDate.time;
    updateDateTime();

    result
      ? (document.querySelector("#date_notification_text").innerHTML =
        currentUserDate.date.slice(0, 10) + " " + currentUserDate.time)
      : (document.querySelector("#date_notification_text").innerHTML =
        "Haven't chosed one");
  });
});

loadSpinnerBtn.addEventListener("click", async () => {

  if (!currentUserDate && !selectedDate) {
    showToast("", "Please select an available time!", false);
  } else {
    let response = await fetch("/api/date", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: selectedDate ? selectedDate : currentUserDate.date.slice(0, 10),
        time: selectedTime ? selectedTime : currentUserDate.time,
      }),
    });

    let result = await response.json();

    cardContainer.innerHTML = "";
    document.getElementById("match-loading-text").style.display = "block";
    document.querySelectorAll("#loadingSpinner").forEach((e) => {
      e.style.display = "block";
    });
    if (result.ok) {
      await displayData();
      document.getElementById("match-loading-text").style.display = "none";
      document.querySelectorAll("#loadingSpinner").forEach((e) => {
        e.style.display = "none";
      });

      cardContainer.innerHTML = "";
      cardIndex = 0;
      renderCard(0);
    }
  }
});

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
    var myModal = new bootstrap.Modal(document.getElementById("matchModal"));
    window.location.href = "/my-matches";
    myModal.hide();
  });

let backToMatchBtn = document.querySelector("#backToMatchBtn");
backToMatchBtn.addEventListener("click", () => {
  window.location.href = window.location.href;
});

// Event listener for time selection change
document.getElementById("timePicker").addEventListener("input", updateDateTime);

document.getElementById("datePicker").min = formatDate(startOfWeek);
document.getElementById("datePicker").max = formatDate(endOfWeek);

document
  .getElementById("datePicker")
  .addEventListener("input", updateSelectedDate);

document
  .getElementById("openModalButton")
  .addEventListener("click", async function () {
    filterModal.show();
    const filterGender = currentUserFilter.gender;

    customRangeSlider.setValue([
      currentUserFilter.minage,
      currentUserFilter.maxage,
    ]);
    customRangeSlider.on("slide", function (sliderValue) {
      document.getElementById("selectedRange").innerText =
        sliderValue[0] + " - " + sliderValue[1];
      minAge = sliderValue[0];
      maxAge = sliderValue[1];
    });
    switch (filterGender) {
      case "Male":
        const radioBtn1 = document.getElementById("btnradio1");
        radioBtn1.checked = true;
        break;
      case "Female":
        const radioBtn2 = document.getElementById("btnradio2");
        radioBtn2.checked = true;
        break;
      case "Other":
        const radioBtn3 = document.getElementById("btnradio3");
        radioBtn3.checked = true;
        break;
      default:
    }
  });

saveChangesButton.addEventListener("click", async (e) => {
  const selectedGenderLabel = document.querySelector(
    'input[name="btnradio"]:checked + label'
  );
  const selectAge = document.querySelector('input[name="ageSelect"]');

  gender = selectedGenderLabel.textContent;
  if (!currentLat || !maxAge || !minAge) {
    try {
      if (!currentLat) {
        currentLat = 0;
        currentLng = 0;
      }
      if (!minAge && !maxAge) {
        minAge = 18;
        maxAge = 50;
      } else if (!minAge) {
        minAge = 18;
      } else if (!maxAge) {
        maxAge = 50;
      }
    } catch (error) {
      console.error(error);
    }
  }
  await createFilter();
});

async function displayData() {
  try {
    cardData = await getCurrentUser();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

this.id = 0;
async function renderCard(cardIndex) {
  cardContainer.style.display = "flex";
  cardContainer.style.justifyContent = "center";

  if (cardData != null && cardIndex < cardData.length) {
    let currentCard = cardData[cardIndex];
    const cardHTMLPromise = getCardHTML(currentCard);
    const cardHTML = await cardHTMLPromise;
    cardContainer.innerHTML = cardHTML;
  } else {
    cardContainer.style.display = "block";
    cardContainer.innerHTML = NoCardHTML();
  }
}

function NoCardHTML() {
  setTimeout(() => {
    reSelectBtn = document.querySelector("#reselect_btn");
    if (reSelectBtn) {
      reSelectBtn.addEventListener("click", () => { });
    }
  });

  return `<h3>No matchable person so far...</h3>
            <h5>You can select another day or filter or go see if others like you back!</h5>
            <div><a href="/match"><button type="button" class="btn w3-btn button-45 id="reselect_btn">Change another date or filter to keep matching</button></a></div>
            <div><a href="/my-matches"><button type="button" class="btn w3-btn button-45" id="reselect_btn">See the match results</button></a></div>
            <div><a href="/member"><button type="button" class="btn w3-btn button-45" id="restaurant_reselect_btn">Change favorite restaurants</button></a></div>

            `;
}

function getCardHTML(card) {
  const placeId = 'ChIJbTKSE4KpQjQRXDZZI57v-pM';
  const backendUrl = "http://localhost:8000/getPlaceDetails";
  let apiKey;
  fetch("/api/getApiKey")
    .then((response) => response.json())
    .then((data) => {
      apiKey = data.apiKey;
    })
    .catch((error) => console.error("Error fetching API key:", error));

  return new Promise((resolve, reject) => {
    fetch(`/getPlaceDetails/${placeId}`)
      .then((response) => response.json())
      .then((detailsData) => {
        const photoReference = detailsData.result.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;

        const cardHTML = ren(card, photoUrl);
        resolve(cardHTML);
      })
      .catch((error) => {
        console.error("Error fetching place details:", error);
        const un_apiUrl = "https://api.unsplash.com/photos/random";
        let imageUrl;
        const query = "restaurant";
        let un_apiKey;
        fetch("/api/getUnsplashApiKey")
          .then((response) => response.json())
          .then((data) => {
            un_apiKey = data.apiKey;
            fetch(`${un_apiUrl}?client_id=${un_apiKey}&query=${query}`)
              .then((response) => response.json())
              .then((data) => {
                console.log(data);
                // imageUrl = data.urls.regular;
                imageUrl = 'https://www.google.com/imgres?q=random%20picture&imgurl=https%3A%2F%2Fmedia.istockphoto.com%2Fid%2F1618846975%2Fphoto%2Fsmile-black-woman-and-hand-pointing-in-studio-for-news-deal-or-coming-soon-announcement-on.jpg%3Fs%3D612x612%26w%3D0%26k%3D20%26c%3DLUvvJu4sGaIry5WLXmfQV7RStbGG5hEQNo8hEFxZSGY%3D&imgrefurl=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Frandom-people-pointing-and-showing-with-hands&docid=ZhSLD1XItFYNhM&tbnid=SXQ3dxo391mSbM&vet=12ahUKEwis_JS41Z2MAxV1ka8BHZZlFeAQM3oECBUQAA..i&w=612&h=612&hcb=2&ved=2ahUKEwis_JS41Z2MAxV1ka8BHZZlFeAQM3oECBUQAA';
                const cardHTML = ren(card, imageUrl);
                resolve(cardHTML);
              })
              .catch((error) => {
                console.error("Error fetching image from Unsplash:", error);
              });
          })
          .catch((error) => console.error("Error fetching API key:", error));
      });
  });
}

function ren(card, photoUrl) {
  let userRestaurant = [];
  card.name.forEach((e) => {
    userRestaurant.push(e.name);
  });

  return `
    <div class="card tinder-card" id="swipeCard">
      <img src="${photoUrl}" class="card-img-top" alt="${card.name}">
      <div class="card-body">
        <div id="scrollContainer" data-spy="scroll" data-target="#swipeCard">
          <h4 class="card-title">${card.name[0].name}</h4>
          <a href="https://www.google.com/maps/place/?q=place_id:${card.name[0].placeid}"><p>${card.name[0].address}</p></a>
          <h4> ${card.profile.name}, ${card.profile.age} </h4>
          <hr>
          <h4 id="scrollspyHeading2">About me</h4>
          <br>

          <h5>I  also like </h5>
          <h5>${userRestaurant} </h5>
          <h5>I am finding a :
          <h6>${card.profile.relationship} relationship.</h6>
          <h5>I am a ${card.profile.diet}.</h5>
          <hr>
          <h5>Swipe right and have a date with me!!</h5>
        </div>
        <button class="btn btn-danger" id="dislikeBtn" onclick="return dislike()">Not interested</button>
        <button class="btn btn-success"id="likeBtn" member_id=${card.member} onclick="return like(${card.member})">Invite</button>
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
  add_restaurant.push(cardData[this.id].name[0].id);
  let response = await fetch("/api/restaurants/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: cardData[this.id].name[0].id }),
  });
  let result = await response.json();
  // sendLike(id)
  var card = document.getElementById("swipeCard");
  card.classList.add("swipe-right");
  setTimeout(function () {
    card.classList.remove("swipe-right");
  }, 300);
  let matchDate = selectedDate ? selectedDate : currentUserDate.date;
  let matchTime = selectedTime ? selectedTime : currentUserDate.time;
  let match_response = await fetch("/api/matches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      USERA: userId,
      USERB: cardData[this.id].member,
      restaurant: cardData[this.id].name[0].id,
      date: matchDate,
      time: matchTime,
      timestamp: getTimeNow(),
      status: false,
    }),
  });
  let match_result = await match_response.json();
  if (match_result.status == true) {
    sendLike(id);
  }
  this.id++;
  setTimeout(function () {
    renderCard(this.id);
  }, 250);
}

function getTimeNow() {
  const now = new Date();
  const timestamp = now.getTime();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(timestamp);
  return formattedDate;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  console.log(
    "Latitude: " +
    position.coords.latitude +
    "\nLongitude: " +
    position.coords.longitude
  );
  currentLat = position.coords.latitude;
  currentLng = position.coords.longitude;
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

//處理時間
function generateTimeOptions() {
  var timePicker = document.getElementById("timePicker");
  timePicker.innerHTML = ""; // Clear existing options
  // Generate time options from 08:00 to 24:00 in one-hour intervals
  for (var hour = 10; hour <= 22; hour = hour + 2) {
    var formattedHour = ("0" + hour).slice(-2);
    var option = document.createElement("option");
    option.value = formattedHour + ":00";
    option.text = formattedHour + ":00";
    timePicker.appendChild(option);
  }
  updateDateTime();
  updateSelectedDate();
}

generateTimeOptions();

function updateDateTime() {
  selectedTime = document.getElementById("timePicker").value;
  document.getElementById("selectedDateTime").innerText =
    "Selected time: " + selectedTime;
}

function updateSelectedDate() {
  selectedDate = document.getElementById("datePicker").value;
  document.getElementById("selectedDate").innerText =
    "Selected date: " + selectedDate;
}

function formatDate(date) {
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  return year + "-" + month + "-" + day;
}

//當前user是否有filter
async function checkFilter() {
  let response = await fetch("/api/filter", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let result = await response.json();
  currentUserFilter = result.data[0];
  if (currentUserFilter == null) {
    filterModal.show();
  } else {
    return result.data[0];
  }
}

async function checkDate() {
  let response = await fetch("/api/date", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let result = await response.json();

  if (result.error) {
    //
  } else {
    return result.data;
  }
}

//filter新增
async function createFilter() {
  let response = await fetch("/api/filter", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gender: gender,
      min: minAge,
      max: maxAge,
      lat: currentLat,
      lng: currentLng,
      // "gender": currentUserFilter.gender?currentUserFilter.gender:gender,
      // "min": currentUserFilter.minage?currentUserFilter.minage:minAge,
      // "max": currentUserFilter.maxAge?currentUserFilter.maxAge:maxAge,
      // "lat": currentUserFilter.lat?currentUserFilter.lat:currentLat,
      // "lng": currentUserFilter.lng?currentUserFilter.lng:gender,
    }),
  });
  let result = await response.json();
  if (result.ok) {
    window.location.href = window.location.href;
  }
  if (result.error) {
    //
  }
}

function showToast(title, msg, color) {
  iziToast.show({
    title: title,
    titleColor: "white",
    message: msg,
    messageColor: "white",
    messageSize: "50px",
    messageLineHeight: "50px",
    timeout: color ? 10000 : 1500,
    position: "topRight",
    backgroundColor: color ? "#FFC47E" : "#DC8686",
    theme: "light",
    color: "#FBF6EE",
    icon: color ? "fa fa-bell" : "fa fa-close",
    iconColor: "white",
    animateOutside: false,
  });
  const toastContainer = document.querySelector(
    ".iziToast-container .iziToast-message"
  );
  toastContainer.classList.add("custom-message-style");
}

//得到符合current user的匹配餐廳資料
async function getCurrentUser() {
  let response = await fetch("/api/currentuser", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let result = await response.json();
  return result.data;
}

//連接並傳送server當前使用者id
function connect() {
  socket.on("connect", async () => {
    userId = await login_check();
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
  // await login_check
  socket.emit("setUserId", userId);

  socket.emit("like", likedUserId);
}

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
    } catch (error) { }
  }
}
