const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: "my_simple_secret", // Use a simple string, but not recommended for production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));


// Static files
app.use(express.static("public"));

// Set up Handlebars
app.engine('hbs', exphbs.engine({ 
    extname: 'hbs',
    defaultLayout: 'main', // Set a default layout (if you have one)
    layoutsDir: path.join(__dirname, 'views/layouts'), // Layouts folder
    partialsDir: path.join(__dirname, 'views/partials') // Partials folder
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const routes = require("./server/routes/user");
// Import admin routes
const adminRoutes = require("./server/routes/admin");
app.use("/admin", adminRoutes); 

app.use('/', routes);
app.use("/uploads", express.static("uploads"));


app.listen(port, () => {
    console.log("Listening on port: " + port);
});
