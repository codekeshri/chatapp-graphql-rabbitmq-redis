const socket = io("http://localhost:3000");
const usertoken = localStorage.getItem("token");
const username = localStorage.getItem("username");
let userId = localStorage.getItem("userId");
const feedback = document.getElementById("feedback");
const message = document.getElementById("messageinput");
let pollData = [];
var notificationsEnabled = true;
const bellIcon = document.getElementById("notificationBell");

//user-joined to server and receive broadcast for the same from server
socket.on("connect", () => {
  socket.emit("user-joined", username);
});

socket.on("user-joined-broadcast", (username) => {
  updateMessage(`${username} joined the chat`);
});

//when user sends a message
socket.on("receive-message", (data) => {
  console.log("recieve-message event", data);
  feedback.innerHTML = "";
  displayMessage(data.name, data.message);
});

//user-left broadcast
socket.on("user-left", (username) => {
  updateMessage(`${username} left the chat`);
});

// Typing Indicator Listen to the keypress Event in messageinput field
message.addEventListener("keypress", function () {
  socket.emit("typing", username);
});

socket.on("typing", (data) => {
  feedback.innerHTML = "<p><em>" + data + " is typing...</em><p>";
});

const notificationArea = document.getElementById("notification-area");
socket.on("new-notification", (data) => {
  if (notificationsEnabled) {
    main(data);
    notificationArea.innerHTML =
      "<p><em>" + data + " sent a new message...</em><p>";
    setTimeout(() => {
      notificationArea.innerHTML = "";
    }, 5000);
  }
});

window.addEventListener("DOMContentLoaded", function () {
  getAllMessagesFromDB();
  //   fetchPoll();
  document.getElementById("sendbutton").addEventListener("click", async (e) => {
    e.preventDefault();
    sendMessageToServer();
  });

  document
    .getElementById("exitchatbtn")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      window.location.href = "http://localhost:3000";
    });
});

async function polling() {
  const chartData = {
    labels: ["INC", "BJP", "AAP", "RJD"],
    data: pollData,
  };

  try {
    const context = document.getElementById("votechart");
    const chart = new Chart(context, {
      type: "doughnut",
      data: {
        labels: ["INC", "BJP", "AAP", "RJD"],
        datasets: [
          {
            data: pollData,
            backgroundColor: ["green", "orange", "black", "grey"],
          },
        ],
      },
    });

    //vote for the party & update the chart with new data live
    socket.on("update", (index) => {
      chart.data.datasets[0].data[index] += 1;
      chart.update();
    });
  } catch (err) {
    console.log(`Unable to load updated polling chart ${err}`);
  }
}

async function getAllMessagesFromDB() {
  const userId = localStorage.getItem("userId");
  if (!usertoken || !userId) {
    console.log("No new messages");
    return;
  }
  const getMessageMutation = `
  query GetAllMessages {
      getAllMessages {
          message
          sender
        }
    }
    `;

  const obj = {
    query: getMessageMutation,
  };
  try {
    const response = await axios.post("http://localhost:3000/graphql", obj);
    const arr = response.data.data.getAllMessages;
    console.log("response", arr);
    clearMessages();
    const messages = {};
    for (let i = 0; i < arr.length; i++) {
      let message = arr[i].message;
      let name = arr[i].sender;
      const isUser = name === username;
      displayMessage(isUser ? "you" : name, message);
    }
  } catch (err) {
    console.log("Error getting messages", err);
  }
}

async function sendMessageToServer() {
  const messageinput = document.getElementById("messageinput");
  const messageText = messageinput.value;
  const message = {
    message: messageText,
    name: localStorage.getItem("username"),
  };
  if (!usertoken) return;
  try {
    socket.emit("send-message", message);
    displayMessage("you", message.message);
    socket.emit("send-notification", username);

    const sendMessageMutation = `
      mutation Send($message: String!, $sender: String!) {
        send(message: $message, sender: $sender) {
          message
          sender
        }
      }
        `;

    const obj = {
      mutation: sendMessageMutation,
      variables: {message: messageText, sender: username},
    };
    console.log(obj.variables);
    const response = await axios.post("http://localhost:3000/graphql", obj);
    console.log("response", response);
    messageinput.value = "";
  } catch (err) {
    console.log("unable to send", err);
  }
}

function clearMessages() {
  const chatMessages = document.querySelector(".messages");
  chatMessages.innerHTML = "";
}

function updateMessage(message) {
  const messages = document.querySelector(".messages");
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("update");
  messageContainer.textContent = message;
  messages.appendChild(messageContainer);
  messages.scrollTop = messages.scrollHeight;
}

function displayMessage(sender, message) {
  const messages = document.querySelector(".messages");

  const messageContainer = document.createElement("div");
  messageContainer.classList.add(
    sender == "you" ? "my-message" : "other-message"
  );

  const nameContainer = document.createElement("div");
  nameContainer.classList.add("name");
  nameContainer.textContent = sender + ":";

  const br = document.createElement("br");
  nameContainer.appendChild(br);

  const textContainer = document.createElement("div");
  textContainer.classList.add(sender === "you" ? "mytext" : "sendertext");
  textContainer.textContent = message;

  const editContainer = document.createElement("div");
  editContainer.classList.add("edit-delete-container");

  const editIcon = document.createElement("i");
  editIcon.classList.add("fa-regular", "fa-pen-to-square", "edit-icon");
  editIcon.addEventListener("click", function () {
    messages.removeChild(messageContainer);
    document.getElementById("messageinput").value = message;
  });

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-regular", "fa-trash-can", "delete-icon");
  deleteIcon.addEventListener("click", function () {
    messages.removeChild(messageContainer);
    deleteMessage(sender, message);
  });

  editContainer.appendChild(editIcon);
  editContainer.appendChild(deleteIcon);

  messageContainer.appendChild(nameContainer);
  messageContainer.appendChild(textContainer);
  if (sender === "you") {
    messageContainer.appendChild(editContainer);
  }

  messages.appendChild(messageContainer);
  messages.scrollTop = messages.scrollHeight;
}

// For all notification services functions
const checkPermission = () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("No support for service worker");
  }

  if (!("Notification" in window)) {
    throw new Error("Notification API absent in window");
  }
};

// registr service worker
const registerSW = async () => {
  const registration = await navigator.serviceWorker.register("sw.js");
  return registration;
};

//use Notification api
const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission is not granted");
  } else {
    // new Notification("C sent a new message");
    // we want the notification command to be sent from sw
    // for that we need access to sw registeration
    // eventhough we are returinig the registration from the registerSW function it wont be able to access it in global scope as registration function is asynchronous
  }
};

const main = async (data) => {
  checkPermission();
  const reg = await registerSW();
  reg.showNotification(`${data} sent a new message`);
  requestPermission(); //need to call only once
};

bellIcon.addEventListener("click", async (e) => {
  e.preventDefault();
  if (notificationsEnabled) {
    bellIcon.classList.remove("fa-regular", "fa-bell");
    bellIcon.classList.add("fa-regular", "fa-bell-slash");
    alert("Notifications Enabled");
  } else {
    bellIcon.classList.remove("fa-regular", "fa-bell-slash");
    bellIcon.classList.add("fa-regular", "fa-bell");
    alert("Notifications Disabled");
  }
  notificationsEnabled = !notificationsEnabled;
});
