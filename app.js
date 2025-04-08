const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv").config()
const morgan = require("morgan")
const mongoose = require("mongoose")


const app = express()
app.use(morgan("dev"))
app.use(express.json())
app.use(cors())





//All ROUTE
// app.use("/api",User)

app.get("/",(req,res)=>{
    responseMsg(res,200)
})


//PORT 
let port =process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on ${port}`)
});




// DB Connection

let DB = process.env.DB
console.log(DB);

mongoose.connect(process.env.DB)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));



