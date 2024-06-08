const express = require("express");
const nocache = require("nocache");
const session = require("express-session");
const morgan = require("morgan");
const fs = require('fs')
const app = express();
const adminRouter = require("./Router/adminRouter");
const userRouter = require("./Router/userRouter");
const path = require("path");
const flash = require('connect-flash')
const { isUserLogedIn} = require('./Middleware/userMiddleware')
const passport = require('./Service/googleAuth');
// ------------ port -------------
const port = 3000;
const day = 1000 * 60 * 60 * 24;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(nocache());
app.use(morgan("dev"));
app.use(session({
  secret: "secret-Key",
  resave: false,
  cookie: { maxAge: day },
  saveUninitialized: false,
}));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// -------------- re-routing  --------
app.use("/",isUserLogedIn, userRouter);
app.use("/admin", adminRouter);

app.listen(port, () => console.log(` server listening on port http://localhost:${port}`));
