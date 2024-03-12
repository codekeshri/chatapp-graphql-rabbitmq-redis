import {mongoose} from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    message: String,
    sender: String,
  },
  {timestamps: false}
);

export const Messagemodel = mongoose.model("Message", messageSchema);
