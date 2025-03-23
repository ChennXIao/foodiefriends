let signupForm = document.querySelector(".signup_form");

let signinForm = document.querySelector(".signin_form");
let user_result;
let userId;
// let token = localStorage.getItem('token');
let signin_state = document.querySelector("#startToday");
let order_state = document.querySelector(".navbar-btn_order");
let signup_form_box = document.querySelector(".signup_form_box");
let switch_to_signin = document.querySelector(".signup_form_switch");
let switch_to_signup = document.querySelector(".signin_form_switch");
let signin_form_box = document.querySelector(".signin_form_box");
let signup_form_closing = document.querySelector(".signup_form_closing");
let signin_form_closing = document.querySelector(".signin_form_closing");
let mask = document.querySelector(".mask");
let token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
  await login_check();
  console.log(1);
  if (!userId) {
    // window.location.href = "/"
  } else {
    window.location.href = "/match";
  }
});

function handleSignup() {
  let formData = new FormData(signupForm);
  let email = formData.get("email");
  let password = formData.get("password");

  let signup_msg = document.querySelector(".signup_form_msg");
  let url = "/api/user";
  console.log(email);
  if (email === "" || password === "") {
    displayMsg(signup_msg, "Email and password are required!");
  } else {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        if (result.ok) {
          displayMsg(signup_msg, "successfully signed up", "green");
          // window.location.href = window.location.href
        } else {
          displayMsg(signup_msg, result.message);
        }
      });
  }
}

//sign in form
function handleSignin() {
  // e.preventDefault();
  let formData = new FormData(signinForm);
  let email = formData.get("email");
  let password = formData.get("password");
  let signin_msg = document.querySelector(".signin_form_msg");

  let url = "/api/user/auth";

  if (email === "" || password === "") {
    displayMsg(signin_msg, "Email and password are required!");
  } else {
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if (result.error) {
          console.log(result.error);
          displayMsg(signin_msg, "Wrong email or password.");
        } else {
          window.location.href = "/profile";
          console.log(result.token);
          localStorage.setItem("token", result.token);
        }
      });
  }
}

//pack the display message
function displayMsg(element, text, color = "red") {
  element.style.display = "block";
  element.style.color = color;
  element.textContent = text;
}

function loginBoxController(
  clickedItem,
  FadeOutItem = null,
  FadeInItem = null,
  maskShowed
) {
  clickedItem.addEventListener("click", () => {
    if (token) {
      localStorage.removeItem("token");
      window.location.href = "/";
    } else {
      if (FadeOutItem) {
        console.log("click");
        FadeOutItem.style.top = "-500px";
      }
      if (FadeInItem) {
        FadeInItem.style.top = "80px";
      }
      mask.style.display = maskShowed;
    }
  });
}

function handleOrderbtn() {
  order_state.addEventListener("click", () => {
    if (token) {
      window.location.href = "/booking";
    } else {
      loginBoxController(order_state, null, signin_form_box, "block");
    }
  });
}

//detect if the web store the token right now or not
async function login_check() {
  let token = localStorage.getItem("token")
    ? localStorage.getItem("token")
    : document.cookie.replace(
      /(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
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

      return result.id;
    } catch (error) {
      // console.error("Error:", error);
    }
  }
}
