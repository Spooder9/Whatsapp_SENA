document.addEventListener("DOMContentLoaded", () => {
  const password = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  togglePassword.addEventListener("click", () => {
    const isPassword = password.type === "password";
    
    // Cambiar tipo del input
    password.type = isPassword ? "text" : "password";
    
    // Agregar animación de rotación
    togglePassword.style.transform = "scale(0.9) rotate(180deg)";
    togglePassword.style.opacity = "0.5";

    setTimeout(() => {
      togglePassword.textContent = isPassword ? "visibility_off" : "visibility";
      togglePassword.style.transform = "scale(1) rotate(0deg)";
      togglePassword.style.opacity = "1";
    }, 150);
  });
});
