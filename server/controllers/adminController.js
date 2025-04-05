const mysql = require("mysql");
const multer = require("multer");
const path = require("path");

// Set up the MySQL connection pool
const con = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "db_foodorder",
});

// Function to handle admin login
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  // Check if admin email exists in the database
  con.getConnection((err, connection) => {
    if (err) {
      console.log("Database connection error:", err);
      return res.status(500).send("Database connection failed.");
    }

    const query = "SELECT * FROM adminlogin WHERE email = ?";
    connection.query(query, [email], (err, results) => {
      connection.release();
      if (err) {
        console.log("Error fetching admin data:", err);
        return res.status(500).send("Error occurred while checking admin details.");
      }

      if (results.length === 0) {
        return res.send("Admin not found! Invalid email.");
      }

      // Compare the entered password with the stored plain-text password
      if (password === results[0].password) {
        res.redirect("/admin/home"); // Redirect to admin home page
      } else {
        res.send("Incorrect password! Try again.");
      }
    });
  });
};


exports.getUsers = (req, res) => {
  con.getConnection((err, connection) => {
    if (err) {
      console.log("Database connection error:", err);
      return res.status(500).send("Database connection failed.");
    }

    const query = "SELECT id, name, email, password FROM users"; // Fetch all users

    connection.query(query, (err, results) => {
      connection.release();
      if (err) {
        console.log("Error fetching users:", err);
        return res.status(500).send("Error retrieving users.");
      }

      res.render("adminview", { users: results }); // Send users data to HBS file
    });
  });
};



exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  con.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ message: "Database connection failed." });
    }

    const query = "DELETE FROM users WHERE id = ?";
    connection.query(query, [userId], (err, result) => {
      connection.release();
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Failed to delete user." });
      }

      res.json({ message: "User deleted successfully!" });
    });
  });
};


// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: "./uploads/", // Ensure this folder exists
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage });

// Function to add a recipe
exports.addMenu = (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).send("Error uploading image.");
    }

    const { recipiname, price } = req.body;
    const imgname = req.file.filename; // Get uploaded image name

    con.getConnection((err, connection) => {
      if (err) {
        console.error("Database connection error:", err);
        return res.status(500).send("Database connection failed.");
      }

      const query = "INSERT INTO recipie (recipiname, price, imgname) VALUES (?, ?, ?)";
      connection.query(query, [recipiname, price, imgname], (err, result) => {
        connection.release();
        if (err) {
          console.error("Error adding recipe:", err);
          return res.status(500).send("Error adding recipe.");
        }
        res.redirect("/admin/addmenu");
      });
    });
  });
};

exports.viewMenu = (req, res) => {
  con.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).send("Database connection failed.");
    }

    const query = "SELECT * FROM recipie";
    connection.query(query, (err, results) => {
      connection.release();
      if (err) {
        console.error("Error fetching menu items:", err);
        return res.status(500).send("Error retrieving menu.");
      }

      res.render("viewmenu", { recipes: results });
    });
  });
};


exports.getAllRecipes = (req, res) => {
  const query = "SELECT * FROM recipie";

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching recipes:", err);
      return res.status(500).send("Database error");
    }
    res.render("viewmenutable", { recipes: results }); // Render HBS file
  });
};

// Delete a recipe
exports.deleteRecipe = (req, res) => {
  const recipeId = req.params.id;
  const query = "DELETE FROM recipie WHERE id = ?";

  con.query(query, [recipeId], (err, result) => {
    if (err) {
      console.error("Error deleting recipe:", err);
      return res.status(500).send("Failed to delete recipe.");
    }
    res.redirect("/admin/viewmenutable");
  });
};

// Get recipe details for update
exports.getUpdateRecipe = (req, res) => {
  const recipeId = req.params.id;
  const query = "SELECT * FROM recipie WHERE id = ?";
  
  con.query(query, [recipeId], (err, results) => {
      if (err) {
          console.error("Error fetching recipe:", err);
          return res.status(500).send("Database error");
      }
      if (results.length === 0) {
          return res.status(404).send("Recipe not found");
      }
      res.render("updaterecipe", { recipe: results[0] });
  });
};

// Update recipe details
exports.postUpdateRecipe = (req, res) => {
  const recipeId = req.params.id;
  const { recipiname, price } = req.body;
  let query, values;

  if (req.file) {
      query = "UPDATE recipie SET recipiname = ?, price = ?, imgname = ? WHERE id = ?";
      values = [recipiname, price, req.file.filename, recipeId];
  } else {
      query = "UPDATE recipie SET recipiname = ?, price = ? WHERE id = ?";
      values = [recipiname, price, recipeId];
  }

  con.query(query, values, (err) => {
      if (err) {
          console.error("Error updating recipe:", err);
          return res.status(500).send("Update failed.");
      }
      res.redirect("/admin/viewmenutable");
  });
};