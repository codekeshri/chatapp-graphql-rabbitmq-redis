import {mongoose} from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
  },
  {timestamps: false} //disables createdat and updatedat
);

export const Usermodel = mongoose.model("User", userSchema);
