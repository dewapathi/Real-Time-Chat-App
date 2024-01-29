const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/user-route");
const chatRoutes = require("./Routes/chat-route");
const messageRoutes = require("./Routes/message-route");

const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res)=> {
    res.send("Welcome Pradeepa Lakruwan")
});

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;
// console.log(uri);

app.listen(port, (req, res) => {
    console.log(`Server running on port: ${port}`);
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log("MongoDb connection established")).catch((error)=> console.log("MongoDB connection failed: ", error.message));