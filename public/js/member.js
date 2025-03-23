// Get all buttons with class "nav-link"
//detect if the web store the token right now or not
let userId;
let token = localStorage.getItem("token")
  ? localStorage.getItem("token")
  : document.cookie.replace(
      /(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
let restaurants = document.querySelectorAll(".list-group-item");

let store_name = document.querySelector("#store_name");
let restaurants_send = document.querySelector("#restaurants_send");

let restaurantAdd = document.querySelector("#pac-input");
let chosedPlace;

let storeName = document.querySelector("#store_name");
let storePhone = document.querySelector("#store_phone");
let storeAddress = document.querySelector("#store_address");

let phone;
let addr;
let photo;
let placeId;
let request;
let place;
let currentPlace;
let userLat, userLng;
let userProfile;

const buttons = document.querySelectorAll(".nav-link");
const defaultClicked = document.querySelector("#v-pills-profile-tab");
let modifiedRestaurant;
let currentRestaurant;
let previewBtn = document.querySelector("#trial");

const offcanvas = new bootstrap.Offcanvas(
  document.getElementById("offcanvasBottom")
);

let popup_img = document.querySelector("#popup_restaurant_img");
// addListBtn.src = place.photos[0].getUrl({maxWidth: 35, maxHeight: 35})
let restaurants_container = document.querySelector("#restaurants_container");

let restaurantList = [];
let cacheResataurant = [];
let restaurantToUpdate;

let addListBtn = document.querySelector("#add_restaurant_list");
addListBtn.addEventListener("click", async () => {
  // //weird if i delete this code and it fucked up
  // restaurants_send.addEventListener("click",async()=>{
  //   if(cacheResataurant.length<3){
  //     alert("You need to add three restaurants before matching.")
  //   }else{
  //   let response = await fetch('/api/restaurant',{
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`

  //     },
  //     body: JSON.stringify({ "name": cacheResataurant})
  //   })
  //   let result = await response.json()
  //   let data = result

  //   window.location.href = "/match"
  //   }
  // })

  restaurantList = [];
  cacheResataurant.push(currentPlace.name);
  restaurantList.push({
    name: currentPlace.name,
    address: currentPlace.formatted_address,
    price: currentPlace.price_level ? currentPlace.price_level : 0,
    types: currentPlace.types,
    place_id: currentPlace.place_id,
    photo: currentPlace.photos
      ? currentPlace.photos[0]
      : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0NDQ0NDQ0PDg0NDQ0NDQ0NDQ8NDQ4NFhEWFhURExMYHSggGBolGxUWITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAJ8BPgMBIgACEQEDEQH/xAAaAAEBAQEBAQEAAAAAAAAAAAAAAgEDBAUH/8QAMBABAQACAAIGCAcBAQAAAAAAAAECEQMEEiExQVJxFTJRYWKRobEFExQigZKi0XL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A/RAAAAAAAAAADQ0GaNNAZo0oBOjSzQI0adDQOejTpo0Dno0vRoEaNLYCdGlMBg2sAAAAAAAAAAAAAAAAAAAAAayKBjRoDdEipATpulaboE6NLkNAjRpejQIZpemaBGmLsZYCBVTQZWNYAAAAAAAAAAAAAAAAAAAABFJioDWyEVAFSEipAZMVSNkVICZG6Xo0COizTthw7l1SW+UdOLyuWGPSuu3Wu2wHk0yx1sTYDlYyulibAc9JrpU0EJVUgAAAAAAAAAAAAAAAAAAAARcRF4gqKjIuA2RWMZHfg8HLL1cbff3fMESKmL28LkPHf4x/69Mxw4fZjd+7G2/MHi4XKZ5d2p7+p6ceUwx68rvz6ozPj8S+rhZ77La4ZY53rsyvnKD0Zc1hj1YzflNRWN/N4dl7bueV7nk/Ly8N+Vd+U3LZZdWey9oPBcU2PbzXBvStktl6+qb63C8HPwZf1oPNYmx1sRYDlU10sRkDlUrqAAAAAAAAAAAAAAAAAAAAAI6YucdMQXF4oi8Qev8AD5jc9ZSXc6t+17+Z5n8vUmPbOr2Pk8PKyyztllj6nN49PhzOd2sv47wOT4uWeWXSvdNTuis+a6Ns6O9X2uX4d25eUc+P6+XmD0fq/h+p+q+H6rnLY613+3byZTVs9lsB6f1Xw/Vl5v4fq8yuJhcdb75sHa858P1duX43T31a179vn16uQ7MvOfYHg4vrZed+7lXbi+tfO/dxoIrnXSudBzyRV5IoAAAAAAAAAAAAAAAAAAAAEdMXOOmILi8XOLgLj6n4fn0sLhe77V8qPVyXF6OePsv7b/IPXyWHRzzxvc48f18vN75w9Z3L24yXzj5/Mevl5g7Y8zlJrq8+9y2rluF07u+rO2+33PTxOWl7P2/YHPluFu7vZOz316eJw5lOvuVjjJJJ2RoPnc1h0curss3HbkOzLzn2bz+O8Zl7L9Kn8OvVl5wHh4vrXzv3csl8W/uy8793Ogioq7UZA55IXkgAAAAAAAAAAAAAAAAAAAACLiIqAuKiIqA6Sqlc5VSg+7yvE6eGN79avnHh5jDLp5axys32yVz5Tm/y5ZZuXr7dar0+kp4L/YDHmOJJqcPUnw5N/VcXwf5yPSM8H1PSM8F+YN/VcTwf5yZ+q4vg/wA5HpGeC/M9IzwfUE8Tj8TKWXDqvV6uTr+HY2TLcs652zTn6SngvzZ6Tngv9geHi392X/q/dztbnlu2+22otBlTk2poIqVVIAAAAAAAAAAAAAAAAAAAAEVEqBqpUNBcqtucqtguVUrnK3YOkrduezYOmzbn0i0FbZck7ZsG2stZtloFqaUBiWsAAAAAAAAAAAAAAAAAAAAAaxoDWAKakBcptICzaGgrZtIDdm07Ng3bGAAMArG1gAAAAAAAAAAAAAAAAAAAABsAaMAaMAUJAUJAUJAUJAaMAaMAbWAAAAAAAAAAAD//2Q==",
  });
  // restaurantToUpdate = restaurantList[0]

  restaurantList.forEach(async (e, index) => {
    const hasFoodOrRestaurant =
      e.types.includes("food") || e.types.includes("restaurant");
    if (hasFoodOrRestaurant) {
      if (currentRestaurant.some((item) => item.name === e.name)) {
        cacheResataurant.splice(index, 1);

        restaurantList.splice(index, 1);
        showToast("Please choose different restaurants", false);
      } else {
        let restaurant_img = e.photo.hasOwnProperty("getUrl")
          ? e.photo.getUrl({ maxWidth: 315, maxHeight: 315 })
          : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0NDQ0NDQ0PDg0NDQ0NDQ0NDQ8NDQ4NFhEWFhURExMYHSggGBolGxUWITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAJ8BPgMBIgACEQEDEQH/xAAaAAEBAQEBAQEAAAAAAAAAAAAAAgEDBAUH/8QAMBABAQACAAIGCAcBAQAAAAAAAAECEQMEEiExQVJxFTJRYWKRobEFExQigZKi0XL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A/RAAAAAAAAAADQ0GaNNAZo0oBOjSzQI0adDQOejTpo0Dno0vRoEaNLYCdGlMBg2sAAAAAAAAAAAAAAAAAAAAAayKBjRoDdEipATpulaboE6NLkNAjRpejQIZpemaBGmLsZYCBVTQZWNYAAAAAAAAAAAAAAAAAAAABFJioDWyEVAFSEipAZMVSNkVICZG6Xo0COizTthw7l1SW+UdOLyuWGPSuu3Wu2wHk0yx1sTYDlYyulibAc9JrpU0EJVUgAAAAAAAAAAAAAAAAAAAARcRF4gqKjIuA2RWMZHfg8HLL1cbff3fMESKmL28LkPHf4x/69Mxw4fZjd+7G2/MHi4XKZ5d2p7+p6ceUwx68rvz6ozPj8S+rhZ77La4ZY53rsyvnKD0Zc1hj1YzflNRWN/N4dl7bueV7nk/Ly8N+Vd+U3LZZdWey9oPBcU2PbzXBvStktl6+qb63C8HPwZf1oPNYmx1sRYDlU10sRkDlUrqAAAAAAAAAAAAAAAAAAAAAI6YucdMQXF4oi8Qev8AD5jc9ZSXc6t+17+Z5n8vUmPbOr2Pk8PKyyztllj6nN49PhzOd2sv47wOT4uWeWXSvdNTuis+a6Ns6O9X2uX4d25eUc+P6+XmD0fq/h+p+q+H6rnLY613+3byZTVs9lsB6f1Xw/Vl5v4fq8yuJhcdb75sHa858P1duX43T31a179vn16uQ7MvOfYHg4vrZed+7lXbi+tfO/dxoIrnXSudBzyRV5IoAAAAAAAAAAAAAAAAAAAAEdMXOOmILi8XOLgLj6n4fn0sLhe77V8qPVyXF6OePsv7b/IPXyWHRzzxvc48f18vN75w9Z3L24yXzj5/Mevl5g7Y8zlJrq8+9y2rluF07u+rO2+33PTxOWl7P2/YHPluFu7vZOz316eJw5lOvuVjjJJJ2RoPnc1h0curss3HbkOzLzn2bz+O8Zl7L9Kn8OvVl5wHh4vrXzv3csl8W/uy8793Ogioq7UZA55IXkgAAAAAAAAAAAAAAAAAAAACLiIqAuKiIqA6Sqlc5VSg+7yvE6eGN79avnHh5jDLp5axys32yVz5Tm/y5ZZuXr7dar0+kp4L/YDHmOJJqcPUnw5N/VcXwf5yPSM8H1PSM8F+YN/VcTwf5yZ+q4vg/wA5HpGeC/M9IzwfUE8Tj8TKWXDqvV6uTr+HY2TLcs652zTn6SngvzZ6Tngv9geHi392X/q/dztbnlu2+22otBlTk2poIqVVIAAAAAAAAAAAAAAAAAAAAEVEqBqpUNBcqtucqtguVUrnK3YOkrduezYOmzbn0i0FbZck7ZsG2stZtloFqaUBiWsAAAAAAAAAAAAAAAAAAAAAaxoDWAKakBcptICzaGgrZtIDdm07Ng3bGAAMArG1gAAAAAAAAAAAAAAAAAAAABsAaMAaMAUJAUJAUJAUJAaMAaMAbWAAAAAAAAAAAD//2Q==";

        const cardContent = `

  <div class="w3-card">
    <img src="${restaurant_img}" alt="${e.name}" style="width:100%">
    <div class="w3-container" id="restaurant_info_text">
    <h3>${e.name}</h3>
      <p class="w3-opacity">${e.address}</p>
    </div>
  </div>

`;
        restaurantToUpdate = restaurantList;

        let existingElement = document.querySelector(
          `#restaurant_block[order="${index + 1}"]`
        );
        if (existingElement) {
          existingElement.innerHTML = "Waiting...";
        } else {
          //
        }
        document.querySelectorAll("#restaurant_edit_btn").forEach((e) => {
          e.addEventListener("click", () => {
            $("#restaurantModal").modal("show");
            // modifiedRestaurant = item
          });
        });
        offcanvas.hide();
        $("#restaurantModal").modal("hide");

        restaurantAdd.value = "";
        await updateUserRestaurant();

        document.querySelector("#v-pills-restaurant-tab").click();
      }
      // Replace the existing element with the new one
      // existingElement.replaceWith(restaurant_outer_block);
    } else {
      cacheResataurant.splice(index, 1);
      restaurantList.splice(index, 1);
      showToast("You only can add restaurant", false);
    }
  });
});

document
  .querySelector(".sendRestaurant")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
  });

document.addEventListener("DOMContentLoaded", function () {
  // Wait for the DOM content to be fully loaded
  const activeTab = localStorage.getItem("activeTab");

  // Activate the tab based on the localStorage value
  if (activeTab) {
    const tabElement = document.querySelector(`#v-pills-${activeTab}-tab`);
    if (tabElement) {
      tabElement.classList.add("active");
      // Also, show the corresponding tab content if needed
      const tabContentId = tabElement
        .getAttribute("data-bs-target")
        .substring(1);
      document.getElementById(tabContentId).classList.add("show", "active");
    }
  }

  // Clear the localStorage value to avoid keeping it after page load
  localStorage.removeItem("activeTab");
});

const popoverTriggerList = document.querySelectorAll(
  '[data-bs-toggle="popover"]'
);
const popoverList = [...popoverTriggerList].map(
  (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
);

offcanvas._element.addEventListener("shown.bs.offcanvas", function () {
  document.getElementById("offcanvasBottom").style.visibility = "visible";
  document.getElementById("offcanvasBottom").classList.add("position-absolute");
});

offcanvas._element.addEventListener("hidden.bs.offcanvas", function () {
  document.getElementById("offcanvasBottom").style.visibility = "hidden";
});

buttons.forEach((button) => {
  button.addEventListener("click", (event) => {
    // Access the clicked button
    const clickedButton = event.currentTarget.id;
    if (clickedButton == "v-pills-logout-tab") {
      $("#logoutModal").modal("show");
      let logoutBtn = document.querySelector("#logout");
      document.querySelector("#trial").style.display = "none";

      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        deleteCookie("authToken");

        window.location.href = "/";
      });
    } else if (clickedButton == "v-pills-profile-tab w3-border-left") {
      document.querySelector("#trial").style.display = "block";
    } else if (clickedButton == "v-pills-restaurant-tab") {
      document.querySelector("#trial").style.display = "none";

      checkRestaurant().then((result) => {
        currentRestaurant = result;
        const restaurantResultElement =
          document.querySelector("#restaurant_result");
        restaurantResultElement.innerHTML = "";
        if (result && result.length > 0) {
          // Iterate over the result array and create a list item for each entry
          result.forEach((item, index) => {
            // Create a new restaurant block container
            const restaurantBlock = document.createElement("div");
            restaurantBlock.className = "w3-third w3-margin-bottom";
            restaurantBlock.id = "restaurant_block";
            restaurantBlock.setAttribute("order", index + 1);

            // Create a w3-card container
            const cardContainer = document.createElement("div");
            cardContainer.className = "w3-card";

            // Create an image element
            const imageElement = document.createElement("img");
            imageElement.src = "../img/restaurant_image.jpg"; // Replace with your actual image source
            imageElement.alt = "Restaurant Image";
            imageElement.style.width = "100%";

            // Create a w3-container for restaurant info text
            const infoContainer = document.createElement("div");
            infoContainer.className = "w3-container";
            infoContainer.id = "restaurant_info_text";

            const solidParagraph = document.createElement("p");
            // solidParagraph.className = "w3";
            solidParagraph.textContent = item.name;

            // Create paragraphs for restaurant info
            const opacityParagraph = document.createElement("p");
            opacityParagraph.className = "w3-opacity";
            opacityParagraph.textContent = item.address;

            const buttonParagraph = document.createElement("p");
            const addButton = document.createElement("button");
            addButton.className = "w3-button w3-light-grey w3-block";
            addButton.id = "restaurant_add_btn";
            addButton.innerHTML = '<i class="fa fa-edit"></i> Edit';

            // Append everything together
            buttonParagraph.appendChild(addButton);
            infoContainer.appendChild(solidParagraph);
            infoContainer.appendChild(opacityParagraph);
            infoContainer.appendChild(buttonParagraph);
            cardContainer.appendChild(imageElement);
            cardContainer.appendChild(infoContainer);
            restaurantBlock.appendChild(cardContainer);

            // Append the restaurant block to the restaurant result element
            restaurantResultElement.appendChild(restaurantBlock);
          });

          document.querySelectorAll("#restaurant_add_btn").forEach((e) => {
            e.addEventListener("click", () => {
              const restaurantBlock = e.closest(".w3-third");

              // Get the value of the "order" attribute
              const orderValue = restaurantBlock.getAttribute("order");

              // Use the retrieved order value as needed
              modifiedRestaurant = currentRestaurant[orderValue - 1].id;
              $("#restaurantModal").modal("show");
              // modifiedRestaurant = item
            });
          });
        } else {
          restaurantResultElement.innerHTML =
            "<p>No matchable persons found</p>";
        }
      });
    } else {
      //
    }
  });
});

let backToMatchBtn = document.querySelector("#backToMatchBtn");
backToMatchBtn.addEventListener("click", () => {
  window.location.href = "/match";
});

document.querySelector("#toggleButton").addEventListener("click", function () {
  $("#restaurantModal").modal("show");
});

document.addEventListener("DOMContentLoaded", async () => {
  await login_check();
  if (!userId) {
    window.location.href = "/";
  }
  await getUserProfile();
  await displayDay();
});

setTimeout(() => {
  let updateProfileForm = document.querySelector(".update_profile_btn");

  if (updateProfileForm) {
    updateProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let formData = new FormData(updateProfileForm);
      let name = formData.get("name");
      let relationshipGoal = formData.get("relationshipgoal");
      let diet = formData.get("diet");

      let response = await fetch("api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname: name ? name : userProfile.nickname,
          relationshipGoal: relationshipGoal
            ? relationshipGoal
            : userProfile.relationshipGoal,
          diet: diet ? diet : userProfile.diet,
        }),
      });
      let result = await response.json();
      let data = result;
      if (data.ok) {
      }
      const selectedDays = Array.from(
        document.querySelectorAll('input[name="selectedDays"]:checked')
      ).map((checkbox) => checkbox.defaultValue);
      if (selectedDays) {

      }
      let dayResponse = await fetch("api/day", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ selectedDays }),
      });
      let dayResult = await dayResponse.json();
      if (dayResult.ok) {
        showToast("Submit successfully!", true);
      }
    });
  } else {
  }
}, 2000);

previewBtn.addEventListener("click", async function () {
  userProfile = await fetchProfile();
  console.log(userProfile);

  var myModal = new bootstrap.Modal(document.getElementById("staticBackdrop"));
  document.querySelector(".modal-body").innerHTML = getCardHTML(userProfile);

  myModal.show();
});

async function login_check() {
  if (!token) {
    // signin_state.textContent = "登入系統";
    return false;
  } else {
    // signin_state.textContent = "登出系統";
    try {
      let response = await fetch("/api/user/auth", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let result = await response.json();
      userId = result.id;
      console.log(userId);

      return result.id;
    } catch (error) {
    }
  }
}

async function updateUserRestaurant() {
  let response = await fetch("/api/restaurants", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      former: modifiedRestaurant,
      name: restaurantToUpdate,
    }),
  });
  let result = await response.json();
  if (result.error) {
    console.error(result);
  }
}

async function fetchProfile() {
  let response = await fetch(`api/profile/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let result = await response.json();
  return result.data[0];
}

async function getUserProfile() {
  try {
    // Call the restaurant function
    userProfile = await fetchProfile();

    // Log the data
    let profileContent = document.querySelector("#v-pills-home");
    profileContent.innerHTML = `
    <div class="container mt-5">

    <form class="update_profile_btn">

        <label for="input1" class="form-label">Nickname: </label>
        <input type="text" class="form-control" name="name" placeholder=${userProfile.nickname} id="input1">

        <label for="input2" class="form-label">Gender: </label>
        <input type="text" class="form-control" placeholder=${userProfile.gender}  id="input2" disabled>

        <label for="input3" class="form-label">Birthday: </label>
        <input type="text" class="form-control" placeholder=${userProfile.birthday} id="input3" disabled>

        <label for="input4" class="form-label">Relationship: </label>
        <select class="form-select form-select-lg" name="relationshipgoal" id="relationshipSelect">
            <option value="long term">long term</option>
            <option value="short term">short term</option>
            <option value="new friends">new friends</option>
            <option value="not sure yet">not sure yet</option>
          </select>

        <label for="input5" class="form-label" >Dietary Preference: </label>
        <select class="form-select form-select-lg" name="diet" id="dietSelect">
            <option value="vegan">vegan</option>
            <option value="vegetarian">vegetarian</option>
            <option value="meat-eaters">meat-eaters</option>
            <option value="no preference">no preference</option>
          </select>
          <label for="input5" class="form-label" >Day Preference: </label>
          <div id="dayCheckboxes">
          <input type="checkbox" id="day-0" value="Monday" name="selectedDays" class="w3-input w3-border"><label for="day-0">Monday</label>
          <input type="checkbox" id="day-1" value="Tuesday" name="selectedDays" class="w3-input w3-border"><label for="day-1">Tuesday</label>
          <input type="checkbox" id="day-2" value="Wednesday" name="selectedDays" class="w3-input w3-border"><label for="day-2">Wednesday</label>
          <input type="checkbox" id="day-3" value="Thursday" name="selectedDays" class="w3-input w3-border"><label for="day-3">Thursday</label>
          <input type="checkbox" id="day-4" value="Friday" name="selectedDays" class="w3-input w3-border"><label for="day-4">Friday</label>
          <input type="checkbox" id="day-5" value="Saturday" name="selectedDays" class="w3-input w3-border"><label for="day-5">Saturday</label>
          <input type="checkbox" id="day-6" value="Sunday" name="selectedDays" class="w3-input w3-border"><label for="day-6">Sunday</label>
          </div>
      <input type="submit" class="btn btn-success" id="profile_update_btn"></input>
    </form>
    </div>`;
    document.getElementById("dietSelect").value = userProfile.diet;
    document.getElementById("relationshipSelect").value =
      userProfile.relationship;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function getCardHTML(card) {
  const birthdateString = card.birthday;
  const birthdate = new Date(birthdateString);
  const currentDate = new Date();

  const ageInMilliseconds = currentDate - birthdate;
  const ageInYears = Math.floor(
    ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000)
  );
  return `
  <div id="scrollContainer" data-spy="scroll" data-target="#swipeCard">
  <h4 class="card-title"></h4>
  <h4> ${card.nickname}, ${ageInYears} </h4>
  <hr>
  <h4 id="scrollspyHeading2">About me</h4>
  <br>
  <h5>I  also like </h5>
  <h5></h5>
  <h5>I am finding a :
  <h6>${card.relationship} relationship.</h6>
  <h5>I am a ${card.diet}.</h5>
  <hr>
  <h5>Swipe right and have a date with me!!</h5>
</div>

  `;
}

async function checkRestaurant() {
  let response = await fetch(`/api/restaurants/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let result = await response.json();

  if (result.ok) {
    return result.data;
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  userLat = position.coords.latitude;
  userLng = position.coords.longitude;
  console.log(
    "Latitude: " +
      position.coords.latitude +
      "\nLongitude: " +
      position.coords.longitude
  );
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

getLocation();

function initAutocomplete() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: userLat ? userLat : 25.047388,
      lng: userLng ? userLng : 121.516082,
    },
    zoom: 15,
    mapTypeId: "roadmap",
    mapTypeControl: false, // Set to false to hide the map type control
  });
  const placesService = new google.maps.places.PlacesService(map);

  var infowindow = new google.maps.InfoWindow({
    content: "",
  });
  map.addListener("click", (event) => {
    infowindow.close();

    // Get the element using attribute selectors
    // document.getElementById("lat").value = event.latLng.lat();
    // document.getElementById("long").value = event.latLng.lng();
    // console.log(event.placeId)
    // Use the getDetails method to retrieve information about the place
    let placeResult;
    placesService.getDetails(
      { placeId: event.placeId },
      (placeResult, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Access the detailed information about the place
          place = placeResult;
          // offcanvas.style.display ="block"

          offcanvas.show();
          restaurantAdd.value = "";

          currentPlace = place;
          chosedPlace = place.name;
          phone = place.international_phone_number;
          addr = place.formatted_address;
          photo = place.photos;
          storeName.textContent = chosedPlace;

          // storeAddress.textContent = addr.text
          storePhone.textContent = phone;
          storeAddress.textContent = addr;

          popup_img.src = place.photos
            ? place.photos[0].getUrl({ maxWidth: 1000, maxHeight: 1000 })
            : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0NDQ0NDQ0PDg0NDQ0NDQ0NDQ8NDQ4NFhEWFhURExMYHSggGBolGxUWITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAJ8BPgMBIgACEQEDEQH/xAAaAAEBAQEBAQEAAAAAAAAAAAAAAgEDBAUH/8QAMBABAQACAAIGCAcBAQAAAAAAAAECEQMEEiExQVJxFTJRYWKRobEFExQigZKi0XL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A/RAAAAAAAAAADQ0GaNNAZo0oBOjSzQI0adDQOejTpo0Dno0vRoEaNLYCdGlMBg2sAAAAAAAAAAAAAAAAAAAAAayKBjRoDdEipATpulaboE6NLkNAjRpejQIZpemaBGmLsZYCBVTQZWNYAAAAAAAAAAAAAAAAAAAABFJioDWyEVAFSEipAZMVSNkVICZG6Xo0COizTthw7l1SW+UdOLyuWGPSuu3Wu2wHk0yx1sTYDlYyulibAc9JrpU0EJVUgAAAAAAAAAAAAAAAAAAAARcRF4gqKjIuA2RWMZHfg8HLL1cbff3fMESKmL28LkPHf4x/69Mxw4fZjd+7G2/MHi4XKZ5d2p7+p6ceUwx68rvz6ozPj8S+rhZ77La4ZY53rsyvnKD0Zc1hj1YzflNRWN/N4dl7bueV7nk/Ly8N+Vd+U3LZZdWey9oPBcU2PbzXBvStktl6+qb63C8HPwZf1oPNYmx1sRYDlU10sRkDlUrqAAAAAAAAAAAAAAAAAAAAAI6YucdMQXF4oi8Qev8AD5jc9ZSXc6t+17+Z5n8vUmPbOr2Pk8PKyyztllj6nN49PhzOd2sv47wOT4uWeWXSvdNTuis+a6Ns6O9X2uX4d25eUc+P6+XmD0fq/h+p+q+H6rnLY613+3byZTVs9lsB6f1Xw/Vl5v4fq8yuJhcdb75sHa858P1duX43T31a179vn16uQ7MvOfYHg4vrZed+7lXbi+tfO/dxoIrnXSudBzyRV5IoAAAAAAAAAAAAAAAAAAAAEdMXOOmILi8XOLgLj6n4fn0sLhe77V8qPVyXF6OePsv7b/IPXyWHRzzxvc48f18vN75w9Z3L24yXzj5/Mevl5g7Y8zlJrq8+9y2rluF07u+rO2+33PTxOWl7P2/YHPluFu7vZOz316eJw5lOvuVjjJJJ2RoPnc1h0curss3HbkOzLzn2bz+O8Zl7L9Kn8OvVl5wHh4vrXzv3csl8W/uy8793Ogioq7UZA55IXkgAAAAAAAAAAAAAAAAAAAACLiIqAuKiIqA6Sqlc5VSg+7yvE6eGN79avnHh5jDLp5axys32yVz5Tm/y5ZZuXr7dar0+kp4L/YDHmOJJqcPUnw5N/VcXwf5yPSM8H1PSM8F+YN/VcTwf5yZ+q4vg/wA5HpGeC/M9IzwfUE8Tj8TKWXDqvV6uTr+HY2TLcs652zTn6SngvzZ6Tngv9geHi392X/q/dztbnlu2+22otBlTk2poIqVVIAAAAAAAAAAAAAAAAAAAAEVEqBqpUNBcqtucqtguVUrnK3YOkrduezYOmzbn0i0FbZck7ZsG2stZtloFqaUBiWsAAAAAAAAAAAAAAAAAAAAAaxoDWAKakBcptICzaGgrZtIDdm07Ng3bGAAMArG1gAAAAAAAAAAAAAAAAAAAABsAaMAaMAUJAUJAUJAUJAaMAaMAbWAAAAAAAAAAAD//2Q==";

          // currentPlace = place
        } else {
          console.error("Error fetching place details:", status);
        }
      }
    );
  });

  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];
  let pac;

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    markers.forEach((marker) => marker.setMap(null));
    markers.length = 0;

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
      } else {
        offcanvas.show();
        restaurantAdd.value = "";

        currentPlace = place;
        chosedPlace = place.name;
        phone = place.international_phone_number;
        addr = place.formatted_address;
        photo = place.photos;
        storeName.textContent = chosedPlace;

        // storeAddress.textContent = addr.text
        storePhone.textContent = phone;
        storeAddress.textContent = addr;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };
      const marker = new google.maps.Marker({
        map,
        icon: icon,
        title: place.name,
        position: place.geometry.location,
      });

      const service = new google.maps.places.PlacesService(map);
      marker.addListener("click", async function () {
        service.getDetails(
          { placeId: place.place_id },
          async function (placeDetails) {
            offcanvas.show();

            restaurantAdd.value = "";
            place = placeDetails;
            currentPlace = place;
            chosedPlace = place.name;
            phone = place.international_phone_number;
            addr = place.formatted_address;
            photo = place.photos;
            storeName.textContent = chosedPlace;

            // storeAddress.textContent = addr.text
            storePhone.textContent = phone;
            storeAddress.textContent = addr;

            popup_img.src = place.photos
              ? place.photos[0].getUrl({ maxWidth: 1000, maxHeight: 1000 })
              : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0NDQ0NDQ0PDg0NDQ0NDQ0NDQ8NDQ4NFhEWFhURExMYHSggGBolGxUWITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAJ8BPgMBIgACEQEDEQH/xAAaAAEBAQEBAQEAAAAAAAAAAAAAAgEDBAUH/8QAMBABAQACAAIGCAcBAQAAAAAAAAECEQMEEiExQVJxFTJRYWKRobEFExQigZKi0XL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A/RAAAAAAAAAADQ0GaNNAZo0oBOjSzQI0adDQOejTpo0Dno0vRoEaNLYCdGlMBg2sAAAAAAAAAAAAAAAAAAAAAayKBjRoDdEipATpulaboE6NLkNAjRpejQIZpemaBGmLsZYCBVTQZWNYAAAAAAAAAAAAAAAAAAAABFJioDWyEVAFSEipAZMVSNkVICZG6Xo0COizTthw7l1SW+UdOLyuWGPSuu3Wu2wHk0yx1sTYDlYyulibAc9JrpU0EJVUgAAAAAAAAAAAAAAAAAAAARcRF4gqKjIuA2RWMZHfg8HLL1cbff3fMESKmL28LkPHf4x/69Mxw4fZjd+7G2/MHi4XKZ5d2p7+p6ceUwx68rvz6ozPj8S+rhZ77La4ZY53rsyvnKD0Zc1hj1YzflNRWN/N4dl7bueV7nk/Ly8N+Vd+U3LZZdWey9oPBcU2PbzXBvStktl6+qb63C8HPwZf1oPNYmx1sRYDlU10sRkDlUrqAAAAAAAAAAAAAAAAAAAAAI6YucdMQXF4oi8Qev8AD5jc9ZSXc6t+17+Z5n8vUmPbOr2Pk8PKyyztllj6nN49PhzOd2sv47wOT4uWeWXSvdNTuis+a6Ns6O9X2uX4d25eUc+P6+XmD0fq/h+p+q+H6rnLY613+3byZTVs9lsB6f1Xw/Vl5v4fq8yuJhcdb75sHa858P1duX43T31a179vn16uQ7MvOfYHg4vrZed+7lXbi+tfO/dxoIrnXSudBzyRV5IoAAAAAAAAAAAAAAAAAAAAEdMXOOmILi8XOLgLj6n4fn0sLhe77V8qPVyXF6OePsv7b/IPXyWHRzzxvc48f18vN75w9Z3L24yXzj5/Mevl5g7Y8zlJrq8+9y2rluF07u+rO2+33PTxOWl7P2/YHPluFu7vZOz316eJw5lOvuVjjJJJ2RoPnc1h0curss3HbkOzLzn2bz+O8Zl7L9Kn8OvVl5wHh4vrXzv3csl8W/uy8793Ogioq7UZA55IXkgAAAAAAAAAAAAAAAAAAAACLiIqAuKiIqA6Sqlc5VSg+7yvE6eGN79avnHh5jDLp5axys32yVz5Tm/y5ZZuXr7dar0+kp4L/YDHmOJJqcPUnw5N/VcXwf5yPSM8H1PSM8F+YN/VcTwf5yZ+q4vg/wA5HpGeC/M9IzwfUE8Tj8TKWXDqvV6uTr+HY2TLcs652zTn6SngvzZ6Tngv9geHi392X/q/dztbnlu2+22otBlTk2poIqVVIAAAAAAAAAAAAAAAAAAAAEVEqBqpUNBcqtucqtguVUrnK3YOkrduezYOmzbn0i0FbZck7ZsG2stZtloFqaUBiWsAAAAAAAAAAAAAAAAAAAAAaxoDWAKakBcptICzaGgrZtIDdm07Ng3bGAAMArG1gAAAAAAAAAAAAAAAAAAAABsAaMAaMAUJAUJAUJAUJAaMAaMAbWAAAAAAAAAAAD//2Q==";

            infowindow.setContent(
              `<strong>${place.name}</strong><br>${place.formatted_address}`
            );

            // Open the info window
            infowindow.open(map, marker);
          }
        );
      });

      markers.push(marker);
      popup_img.src = place.photos
        ? place.photos[0].getUrl({ maxWidth: 1000, maxHeight: 1000 })
        : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0NDQ0NDQ0PDg0NDQ0NDQ0NDQ8NDQ4NFhEWFhURExMYHSggGBolGxUWITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAJ8BPgMBIgACEQEDEQH/xAAaAAEBAQEBAQEAAAAAAAAAAAAAAgEDBAUH/8QAMBABAQACAAIGCAcBAQAAAAAAAAECEQMEEiExQVJxFTJRYWKRobEFExQigZKi0XL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A/RAAAAAAAAAADQ0GaNNAZo0oBOjSzQI0adDQOejTpo0Dno0vRoEaNLYCdGlMBg2sAAAAAAAAAAAAAAAAAAAAAayKBjRoDdEipATpulaboE6NLkNAjRpejQIZpemaBGmLsZYCBVTQZWNYAAAAAAAAAAAAAAAAAAAABFJioDWyEVAFSEipAZMVSNkVICZG6Xo0COizTthw7l1SW+UdOLyuWGPSuu3Wu2wHk0yx1sTYDlYyulibAc9JrpU0EJVUgAAAAAAAAAAAAAAAAAAAARcRF4gqKjIuA2RWMZHfg8HLL1cbff3fMESKmL28LkPHf4x/69Mxw4fZjd+7G2/MHi4XKZ5d2p7+p6ceUwx68rvz6ozPj8S+rhZ77La4ZY53rsyvnKD0Zc1hj1YzflNRWN/N4dl7bueV7nk/Ly8N+Vd+U3LZZdWey9oPBcU2PbzXBvStktl6+qb63C8HPwZf1oPNYmx1sRYDlU10sRkDlUrqAAAAAAAAAAAAAAAAAAAAAI6YucdMQXF4oi8Qev8AD5jc9ZSXc6t+17+Z5n8vUmPbOr2Pk8PKyyztllj6nN49PhzOd2sv47wOT4uWeWXSvdNTuis+a6Ns6O9X2uX4d25eUc+P6+XmD0fq/h+p+q+H6rnLY613+3byZTVs9lsB6f1Xw/Vl5v4fq8yuJhcdb75sHa858P1duX43T31a179vn16uQ7MvOfYHg4vrZed+7lXbi+tfO/dxoIrnXSudBzyRV5IoAAAAAAAAAAAAAAAAAAAAEdMXOOmILi8XOLgLj6n4fn0sLhe77V8qPVyXF6OePsv7b/IPXyWHRzzxvc48f18vN75w9Z3L24yXzj5/Mevl5g7Y8zlJrq8+9y2rluF07u+rO2+33PTxOWl7P2/YHPluFu7vZOz316eJw5lOvuVjjJJJ2RoPnc1h0curss3HbkOzLzn2bz+O8Zl7L9Kn8OvVl5wHh4vrXzv3csl8W/uy8793Ogioq7UZA55IXkgAAAAAAAAAAAAAAAAAAAACLiIqAuKiIqA6Sqlc5VSg+7yvE6eGN79avnHh5jDLp5axys32yVz5Tm/y5ZZuXr7dar0+kp4L/YDHmOJJqcPUnw5N/VcXwf5yPSM8H1PSM8F+YN/VcTwf5yZ+q4vg/wA5HpGeC/M9IzwfUE8Tj8TKWXDqvV6uTr+HY2TLcs652zTn6SngvzZ6Tngv9geHi392X/q/dztbnlu2+22otBlTk2poIqVVIAAAAAAAAAAAAAAAAAAAAEVEqBqpUNBcqtucqtguVUrnK3YOkrduezYOmzbn0i0FbZck7ZsG2stZtloFqaUBiWsAAAAAAAAAAAAAAAAAAAAAaxoDWAKakBcptICzaGgrZtIDdm07Ng3bGAAMArG1gAAAAAAAAAAAAAAAAAAAABsAaMAaMAUJAUJAUJAUJAaMAaMAbWAAAAAAAAAAAD//2Q==";

      // get photo
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.setCenter(places[0].geometry.location);

    map.fitBounds(bounds);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var offcanvasBody = document.querySelector(".offcanvas-body");
  var searchInput = document.getElementById("pac-input");
});

function addRestaurant() {
  restaurantAdd.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputValue = restaurantAdd.value;
      document.querySelector(".sendRestaurant").reset();
      store_name.textContent = inputValue;
      // toggleButton.click();
      restaurantAdd.value = "";
    }
  });
}

async function getDay() {
  let response = await fetch("/api/day", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let result = await response.json();
  return result;
  if (result.error) {
  }
}

async function displayDay() {
  let filterDay = await getDay();
  const checkboxes = document.getElementsByName("selectedDays");

  // Iterate through checkboxes and set the default checked state
  checkboxes.forEach((checkbox) => {
    // Get the value of the checkbox (e.g., "Sunday", "Tuesday", etc.)
    const dayValue = checkbox.value;

    // Check if the day is included in the user's selected days
    if (filterDay.data.includes(dayValue)) {
      // Set the checkbox as checked
      checkbox.checked = true;
    }
  });
}

function createDayCheckboxes() {
  const dayCheckboxes = document.getElementById("dayCheckboxes");
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  if (dayCheckboxes) {
    for (let i = 0; i < 7; i++) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `day-${i}`;
      checkbox.value = weekdays[i];
      checkbox.name = "selectedDays";
      checkbox.className = "w3-input w3-border";
      const label = document.createElement("label");
      label.htmlFor = `day-${i}`;
      label.innerText = weekdays[i];

      dayCheckboxes.appendChild(checkbox);
      dayCheckboxes.appendChild(label);
    }
  }
}

function deleteCookie(cookieName) {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

createDayCheckboxes();

window.initAutocomplete = initAutocomplete;
