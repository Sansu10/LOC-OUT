const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model/user"); 

const app = express();
app.use(cors());
app.use(express.json()); 

// Connect to MongoDB
const mongoURI = 'mongodb+srv://sanskarguptakb:Mongodb%40123@cluster0.6fxh3.mongodb.net/Auth001?retryWrites=true&w=majority';
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error: ", err));

// Registration Route
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (isValidPassword) {
      const token = jwt.sign(
        { name: user.name, email: user.email },
        "secret123", 
        { expiresIn: '1h' } 
      );
      res.json({ token, user });
    } else {
      res.status(400).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 5000; 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
