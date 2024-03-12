import {mongoose} from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectToMongoDB = async () => {
  try {
    return await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.log(err);
  }
};
