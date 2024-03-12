import {typeDefs, resolvers} from "./schema/userSchema.js";

const signup = async (req, res, next) => {
  resolvers.signup(parent, req.body);
};

const signin = async (req, res) => {
  resolvers.login(parent, req.body);
};

module.exports = {
  signup,
  signin,
};
