const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Signup & Login
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/login", (req, res) => res.render("login", { title: "Login" }));
router.get("/signup", (req, res) => res.render("signup", { title: "Sign up" }));

// Static Pages
router.get("/", (req, res) => res.render("home", { title: "Home" }));
router.get("/about", (req, res) => res.render("about", { title: "About Us" }));
router.get("/services", (req, res) => res.render("services", { title: "Our Services" }));
router.get("/afterlogin", (req, res) => res.render("afterlogin", { title: "After Login" }));

// Menu & Recipe
router.get("/viewmenu", userController.viewMenu);
router.get("/recipe/:id", userController.getRecipeDetails);

// Orders
router.post("/order", userController.placeOrder);
router.get("/myorder", userController.viewMyOrders);


module.exports = router;
