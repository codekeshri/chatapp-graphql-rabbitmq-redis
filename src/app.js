// import {ApolloServer} from "apollo-server-express";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import {connectToMongoDB} from "./utils/mongoose.js";
import {typeDefs, resolvers} from "./schema/userSchema.js";
import {fileURLToPath} from "url";
import path from "path";
import {createServer} from "http";
import {Server} from "socket.io";
import {connectQueue} from "./utils/rabbitmq.js";

const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 1000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "../src/views")));

async function main() {
  const gqlServer = new ApolloServer({typeDefs, resolvers});
  await gqlServer.start();

  app.use("/graphql", expressMiddleware(gqlServer));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../src/views/index.html"));
  });

  connectToMongoDB()
    .then(async () => {
      console.log("\nMongodb connected");
      server.listen(
        port,
        console.log(
          `GraphQL ApolloServer running \nExpress running on port ${port}`
        )
      );
      await connectQueue();
      console.log("RabbitMQ connected");
    })
    .catch((err) => {
      console.log("database not connected", err);
    });
}

main();

//initialize the socket aka connection event and give socket.id key to user
const users = [];
const parties = [
  {votes: 0, label: "INC"},
  {votes: 0, label: "BJP"},
  {votes: 0, label: "AAP"},
  {votes: 0, label: "RJD"},
];

io.on("connection", (socket) => {
  socket.on("user-joined", (username) => {
    socket.broadcast.emit("user-joined-broadcast", username);
  });

  // send-message event and recieve-message broadcast
  socket.on("send-message", (message) => {
    socket.broadcast.emit("receive-message", message);
  });

  // emit the voting stats to all users
  socket.on("vote", (index) => {
    parties[index].votes += 1;
    io.emit("update", index);
  });

  // listent to typing event and broadcast it
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  // notifications live
  socket.on("send-notification", (message) => {
    io.emit("new-notification", message);
  });
});
