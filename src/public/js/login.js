document.addEventListener("DOMContentLoaded", () => {

  const inputs = document.querySelectorAll(".input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      let parent = input.parentNode.parentNode;
      parent.classList.add("focus");
    });
    input.addEventListener("blur", () => {
      let parent = input.parentNode.parentNode;
      if (input.value === "") {
        parent.classList.remove("focus");
      }
    });
  });

  const username = document.getElementById("username");
  inputsMayus([username]);

  const hideShowPassWord = document.getElementById("hideShowPassWord"),
    password = document.getElementById("password");
  hideShowPassWord.addEventListener("click", () => {
    if (password.type === "password") {
      password.type = "text";
      hideShowPassWord.innerHTML = `<i class="bx bx-hide"></i>`;
    } else {
      password.type = "password";
      hideShowPassWord.innerHTML = `<i class='bx bx-show-alt'></i>`;
    }
  });

  const usernameInput = document.getElementById("username");
  const usernameIcon = document.querySelector(".input-div.one i");
  const usernameLabel = document.querySelector(".input-div.one label");

  usernameInput.addEventListener("focus", function() {
      usernameIcon.style.display = "none";
      usernameLabel.style.display = "none";
  });

  usernameInput.addEventListener("blur", function() {
      if (usernameInput.value === "") {
          usernameIcon.style.display = "block";
          usernameLabel.style.display = "block";
      }
  });

  // Para el campo de contraseña
  const passwordInput = document.getElementById("password");
  const passwordIcon = document.querySelector(".input-div.two i");
  const passwordLabel = document.querySelector(".input-div.two label");

  passwordInput.addEventListener("focus", function() {
      passwordIcon.style.display = "none";
      passwordLabel.style.display = "none";
  });

  passwordInput.addEventListener("blur", function() {
      if (passwordInput.value === "") {
          passwordIcon.style.display = "block";
          passwordLabel.style.display = "block";
      }
  });
});


