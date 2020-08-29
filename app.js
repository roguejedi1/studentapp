const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const engine = require('ejs-mate');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const localMongoose = require('passport-local-mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const User = require('./models/user');
const Teacher = require('./models/teacher');
const Student = require('./models/student');
const Notification = require('./models/notification');

const indexRouter = require('./routes/index');
const studentRouter = require('./routes/student');
const teacherRouter = require('./routes/teacher');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// connect to database
mongoose.connect("mongodb://localhost/studentapp", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("we're connected!");
});

app.use(express.static('public'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Express session setup
app.use(session({
  secret: 'studentapp',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use('Teacher-local', new LocalStrategy({
  username: 'username',
  password: 'password'
},
  (username, password, done) => {
    Teacher.findOne({
      username: username
    }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        return done(null, false, { message: 'Username not valid' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Password not valud' });
      }
      return done(null, user);
    });
  }
));

passport.use('Student-local', new LocalStrategy({
  username: 'username',
  password: 'password'
},
  (username, password, done) => {
    Student.findOne({
      username: username
    }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        return done(null, false, { message: 'Username not valid' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Password incorrect' });
      }
      return done(null, user);
    })
  }
));

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  Teacher.findById(id, function (err, user) {
    if (err) done(err);
    if (user) {
      done(null, user);
    } else {
      Student.findById(id, function (err, user) {
        if (err) done(err);
        done(null, user);
      });
    }
  });
});

app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.notifications = null;
  if(req.user){
    let currentUser = req.user;
    const currentUserNotifications = await Notification.find({'receiverUserId': req.user._id});
    res.locals.notifications = currentUserNotifications;
    // let currentUser = await User.findById(req.user._id).populate("notifications");
    // res.locals.notifications = currentUser.notifications;
  }
  next();
});

app.use('/', indexRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
