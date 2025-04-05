const mysql = require("mysql");
const bcrypt = require("bcryptjs");


// Set up the MySQL connection pool
const con = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "db_foodorder",
});

// Function to handle user signup
exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.log("Error hashing password:", err);
      return res.status(500).send("Error occurred while encrypting password.");
    }

    // Store user details in the database
    con.getConnection((err, connection) => {
      if (err) {
        console.log("Database connection error:", err);
        return res.status(500).send("Database connection failed.");
      }

      const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      connection.query(query, [name, email, hashedPassword], (err, result) => {
        connection.release();
        if (!err) {
        //   res.send("User registered successfully!");
        res.redirect("/login");

        } else {
          console.log("Error saving user:", err);
          res.status(500).send("Error occurred while saving user details.");
        }
      });
    });
  });
};



exports.login = (req, res) => {
  const { email, password } = req.body;

  con.getConnection((err, connection) => {
    if (err) {
      console.log("Database connection error:", err);
      return res.status(500).send("Database connection failed.");
    }

    const query = "SELECT * FROM users WHERE email = ?";
    connection.query(query, [email], (err, results) => {
      connection.release();
      if (err) {
        console.log("SQL Error:", err.sqlMessage);
        return res.status(500).send("Error occurred while verifying user.");
      }

      if (results.length === 0) {
        return res.send("Invalid email or password!");
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.log("Error comparing passwords:", err);
          return res.status(500).send("Error occurred while verifying password.");
        }

        if (isMatch) {
          req.session.userEmail = user.email;  // Store email in session
          res.render("afterlogin", { name: user.name }); // Pass user name
        } else {
          res.send("Invalid email or password!");
        }
      });
    });
  });
};


exports.getMenu = (req, res) => {
  const query = "SELECT * FROM recipie"; // Fetch menu items from DB

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching menu items:", err);
      return res.status(500).send("Database error");
    }
    res.render("viewmenu", { recipes: results }); // Send data to HBS
  });
};

exports.viewMenu = (req, res) => {
  const query = "SELECT * FROM recipie";

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching menu:", err);
      return res.status(500).send("Database error");
    }
    console.log("Menu fetched:", results);
    res.render("viewmenu", { recipes: results });
  });
};


exports.getRecipeDetails = (req, res) => {
  const recipeId = req.params.id;
  console.log("Fetching recipe for ID:", recipeId); // Debugging

  const query = "SELECT * FROM recipie WHERE id = ?";
  con.query(query, [recipeId], (err, results) => {
    if (err) {
      console.error("Error fetching recipe:", err);
      return res.status(500).send("Database error");
    }
    if (results.length === 0) {
      console.log("Recipe not found for ID:", recipeId);
      return res.status(404).send("Recipe not found");
    }
    console.log("Recipe found:", results[0]); // Debugging
    res.render("recipedetails", { recipe: results[0] });
  });
};


exports.placeOrder = (req, res) => {
  if (!req.session.userEmail) {
    return res.status(401).send("You must be logged in to place an order.");
  }

  const email = req.session.userEmail; // Get email from session
  const { food, price, img_name } = req.body;
  
  const query = "INSERT INTO myorder (food, price, img_name, email) VALUES (?, ?, ?, ?)";
  con.query(query, [food, price, img_name, email], (err) => {
    if (err) {
      console.error("Error placing order:", err);
      return res.status(500).send("Order failed.");
    }
    res.send("Order placed successfully!");
  });
};

exports.viewMyOrders = (req, res) => {
  if (!req.session.userEmail) {
      return res.status(401).send("You must be logged in to view your orders.");
  }

  const email = req.session.userEmail; // Get email from session

  const query = "SELECT food, price, img_name FROM myorder WHERE email = ?";
  con.query(query, [email], (err, results) => {
      if (err) {
          console.error("Error fetching orders:", err);
          return res.status(500).send("Database error.");
      }
      res.render("myorder", { orders: results });
  });
};
