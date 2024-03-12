const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const signinBtn = document.getElementById("signinBtn");
const nameField = document.getElementById("nameField");
const title = document.getElementById("title");
const err = document.getElementById("errMessage");

const forgotpasswordLink = document.getElementById("forgotPasswordId");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

signinBtn.onclick = async function (event) {
  event.preventDefault(event);
  nameField.style.maxHeight = "0";
  signupBtn.classList.add("disable");
  signinBtn.classList.remove("disable");
  err.style.display = "none";

  const email = inputEmail.value;
  const password = inputPassword.value;
  if (!email || !password) return;

  const signinMutation = `
  mutation Login($email: String!, $password: String!) {
    login( email: $email, password: $password) {
      token
      user{
        id
        name
        email
      
      }
      
    }
  }
`;

  const obj = {query: signinMutation, variables: {email, password}};

  try {
    const res = await axios.post("http://localhost:3000/graphql", obj);
    console.log("response", res);
    const token = res.data.data.login.token;
    const user = res.data.data.login.user;
    const userId = user.id;
    const username = user.name;

    if (token) window.location.href = "./chat.html";
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
  } catch (err) {
    console.log("Error signing up", err);
  }
};

signupBtn.onclick = async function (event) {
  event.preventDefault(event);
  nameField.style.maxHeight = "65px";
  signupBtn.classList.remove("disable");
  signinBtn.classList.add("disable");

  err.style.display = "none";

  const name = inputName.value;
  const email = inputEmail.value;
  const password = inputPassword.value;

  const signupMutation = `
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      name
      email
      password
    }
  }
`;

  const obj = {query: signupMutation, variables: {name, email, password}};

  if (!name || !email || !password) return;

  try {
    const res = await axios.post("http://localhost:3000/graphql", obj);
    console.log(res);
  } catch (err) {
    console.log("Error signing up", err);
  }
};
