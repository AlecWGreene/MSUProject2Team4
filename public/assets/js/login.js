$(document).ready(() => {
  // Getting references to our form and inputs
  const loginForm = $("form.login");
  const usernameInput = $("input#username-input");
  const emailInput = $("input#email-input");
  const passwordInput = $("input#password-input");

  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", event => {
    event.preventDefault();
    const userData = {
      username: usernameInput.val().trim(),
      email: emailInput.val().trim(),
      password: passwordInput.val().trim()
    };

    if (!userData.username || !userData.email || !userData.password) {
      return;
    }

    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.username, userData.email, userData.password);
    usernameInput.val("");
    emailInput.val("");
    passwordInput.val("");
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(username, email, password) {
    $.post("/api/login", {
      username: username,
      email: email,
      password: password
    })
      .then(() => {
        window.location.replace("/home");
        // If there's an error, log the error
      })
      .catch(err => {
        console.log(err);
      });
  }
});
