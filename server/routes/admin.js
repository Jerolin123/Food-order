const express = require("express");
const router = express.Router();
const path = require("path"); // ✅ Import path module
const multer = require("multer"); // ✅ Import multer
const adminController = require("../controllers/adminController");

// ✅ Configure Multer for image upload
const storage = multer.diskStorage({
    destination: "./uploads/", // Ensure this folder exists
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// ✅ Default admin home route
router.get("/", (req, res) => {
    res.render("adminhome"); // Ensure "adminhome.hbs" exists in "views" folder
});

// Admin login page
router.get("/home", (req, res) => {
    res.render("admindashboard"); // Ensure this file exists in views folder
});
router.get("/addmenu", (req, res) => {
    res.render("addmenu"); // Ensure "addmenu.hbs" exists in "views" folder
});

router.get("/adminview", adminController.getUsers);

// Admin login submission
router.post("/login", adminController.adminLogin);
router.post("/addmenu", adminController.addMenu);

router.delete("/delete/:id", adminController.deleteUser);
router.get("/viewmenu", adminController.viewMenu);

// Route to fetch all recipes
router.get("/viewmenutable", adminController.getAllRecipes);

// Route to delete a recipe
router.post("/deleterecipe/:id", adminController.deleteRecipe);

// Route to get recipe details for update
router.get("/updaterecipe/:id", adminController.getUpdateRecipe);

// Route to update recipe details
router.post("/updaterecipe/:id", upload.single("image"), adminController.postUpdateRecipe);

module.exports = router;
