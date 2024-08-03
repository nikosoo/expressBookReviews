const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

// Use session middleware
app.use(
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (token == null) return res.sendStatus(401); // If no token, return 401

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) return res.sendStatus(403); // If token is not valid, return 403
    req.user = user; // Attach user to request object
    next(); // Pass control to the next middleware
  });
};

// Apply authentication middleware to routes under /customer/auth
app.use("/customer/auth", authenticateToken, customer_routes);

// Apply routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
