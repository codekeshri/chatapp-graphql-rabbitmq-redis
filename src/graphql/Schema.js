import {Usermodel} from "../models/User.js";
import {Messagemodel} from "../models/Message.js";
import {sendEmail} from "../services/email.js";
import {gql} from "apollo-server-express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import client from "../utils/redis.js";

const typeDefs = gql`
  type User {
    id: ID
    name: String!
    email: String!
    password: String!
  }

  type Message {
    message: String!
    sender: String!
  }

  type Response {
    success: Boolean
    message: String
  }

  type Query {
    getUser(id: ID!): User
    getAllUsers: [User]
    getAllMessages: [Message]
    welcomeEmail: Response
  }

  type AuthPayload {
    user: User
    token: String
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
    send(message: String!, sender: String!): Message
  }
`;

const resolvers = {
  Query: {
    getUser: async (parent, {id}) => {
      try {
        await Usermodel.findOne({_id: id});
      } catch (err) {
        console.log(err);
      }
    },

    getAllUsers: async () => {
      try {
        return await Usermodel.find();
      } catch (err) {
        console.log(err);
      }
    },

    getAllMessages: async (parent, args, context, info) => {
      try {
        const cache_data = await client.get("messages");
        console.log("cache_data", cache_data);
        if (cache_data !== null) {
          const data = JSON.parse(cache_data);
          return data;
        }

        const messagesArray = await Messagemodel.find();
        await client.set("messages", JSON.stringify(messagesArray));
        await client.expire("messages", 300);

        return messagesArray;
      } catch (err) {
        console.log(err);
      }
    },

    welcomeEmail: async (parent, args, context, info) => {
      try {
        console.log("sending email");
        await sendEmail();
        console.log("email sent");
        return {message: "Welcome email sent successfully", success: true};
      } catch (err) {
        console.log(err);
      }
    },
  },

  Mutation: {
    signup: async (parent, args, context, info) => {
      try {
        const {name, email, password} = args;
        const userExists = await Usermodel.findOne({email});
        if (userExists) {
          throw Error("This email already registered");
        }
        const hpassword = await argon2.hash(password);

        const newUser = await Usermodel.create({
          name,
          email,
          password: hpassword,
        });
        await sendEmail(email);
        return newUser;
      } catch (err) {
        console.log(err);
      }
    },

    login: async (parent, args, context, info) => {
      try {
        const {email, password} = args;
        const user = await Usermodel.findOne({email});
        if (!user) {
          throw Error("This email is not registered");
        }

        const flag = await argon2.verify(user.password, password);
        if (!flag) {
          throw Error("Incorrect Password", flag);
        }
        const token = jwt.sign(
          {data: {userId: user._id, email, name: user.name}},
          "secretkey"
        );
        return {user, token};
      } catch (err) {
        console.log(err);
      }
    },

    send: async (parent, args, context, info) => {
      console.log("req from client", args);
      try {
        const {message, sender} = args;
        const newMessage = await Messagemodel.create({message, sender});
        return newMessage;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

export {typeDefs, resolvers};
