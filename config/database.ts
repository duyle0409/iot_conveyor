import mongoose from "mongoose";

export const connect = async () => {
  try {
    mongoose.connect(`${process.env.DATABASE}`)
    .then(() => 
      console.log("Connect successfully to database")
    );
  } catch (error) {
    console.log("Connect fail to database");
  }
}