const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
const port = 4000; // Change this to your desired port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gatherandgo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Schema and Model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String // Store hashed passwords
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Register Route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error registering user' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).send({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error logging in' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// const nodemailer = require('nodemailer');

// // Add this route to handle the contact form submission
// app.post('/contact', async (req, res) => {
//     const { name, email, message } = req.body;

//     // Configure Nodemailer
//     const transporter = nodemailer.createTransport({
//         service: 'gmail', // or any other email service provider
//         auth: {
//             user: 'gupta522laxmi@gmail.com', // your email address
//             pass: '9559285231', // your email password
//         },
//     });

//     const mailOptions = {
//         from: email,
//         to: 'gupta522laxmi@gmail.com',
//         subject: 'Contact Us Form Submission',
//         text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         res.send('Your message has been sent successfully!');
//     } catch (error) {
//         res.status(500).send('Failed to send message. Please try again later.');
//     }
// });
// app.use(bodyParser.urlencoded({ extended: true }));