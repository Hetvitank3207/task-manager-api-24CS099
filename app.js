const express=require("express");
const mongoose=require("mongoose");

const app=express();

const logger= require("./middleware/logger");
const errorHandler= require("./middleware/errorHandler");
const taskRoutes= require("./routes/taskRoutes");

mongoose.connect("mongodb://localhost:27017/Practical_5")
  .then(()=>{
    console.log("MongoDB connected successfully");
  })
  .catch((error)=>{
    console.log("MongoDb connection failed");
  });
app.use(express.json());
app.use(logger);
app.use("/tasks",taskRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
