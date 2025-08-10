import mongoose from "mongoose";

export async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("✅ MongoDB is connected now");
    });

    connection.on("error", (err) => {
      console.error("❌ MongoDB connection error: " + err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Something went wrong in connecting to DB");
    console.error(error);
  }
}
