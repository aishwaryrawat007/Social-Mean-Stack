const express = require('express');
const bodyParser =  require('body-parser');

const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/users')
const path= require('path');

const app = express();

//mongo DB connection
mongoose.connect("mongodb+srv://aishwary:0iturbqpcMLxe3qo@cluster0.nkp3d.mongodb.net/node-angular?retryWrites=true&w=majority")
.then(()=>{
  console.log("Connected to Database");
}).catch((error)=>{
  console.log("Connection failed", error);
})

//body parser middleware configuration to parse incoming req stream and make it accessible
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
//express static is used to allow/grant access to the mentioned folders/files on the backend.
// the path parameter of static method allows all the request to forward to the mentioned path.
app.use("/images", express.static(path.join("backend/images")))

//Handling CORS issue by setting appropriate headers for all the incomming requests through middleware
app.use((req,res, next) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","Origin,X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE, OPTIONS");
  next();
});

//passing postRouts to app to configure our route paths. Specifically for paths redirecting to "/api/posts"
app.use("/api/posts",postsRoutes);
app.use("/api/user",userRoutes);

module.exports = app;
