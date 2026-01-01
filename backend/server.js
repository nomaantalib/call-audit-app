import "./src/config/env.js";
import app from "./src/app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

// Connect DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });
