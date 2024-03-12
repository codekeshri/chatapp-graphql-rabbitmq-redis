import {mongoose} from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    message: String,
    sender: String,
  },
  {timestamps: false} //disables createdat and updatedat
);

export const Messagemodel = mongoose.model("Message", messageSchema);
