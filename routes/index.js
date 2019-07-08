var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user.js");
var Campground=require("../models/campground.js");
/*==============================*/
var async=require("async");         //FOR ASYNC WATERFALL
var crypto=require("crypto");       //FOR CREATING A ENCRYPTED TOKEN
var nodemailer=require("nodemailer"); //FOR SENDING E-MAIL
/*==============================*/
var middleware=require("../middleware");
var Notification = require("../models/notification");

//HOME PAGE
router.get("/",function(req,res){
   res.render("landing.ejs",{page:"landing"}); 
});
/*=========================================================
                AUTHENTICATION  ROUTES
  =========================================================*/
//SHOW REGISTER FORM
router.get("/register",function(req, res) {
    res.render("register.ejs",{page:"register"});
})
//SIGNUP LOGIC
router.post("/register",async function(req, res) {
    var newUser=new User({username:req.body.username,avatar:req.body.avatar,firstName:req.body.firstName,
                          lastName:req.body.lastName,email:req.body.email,about:req.body.about});
                          
    if(req.body.adminCode === process.env.SECRET_KEY) {   //IF USER'S ADMIN CODE IS SECRET KEY,MAKE HIM ADMIN,SECRET KEY DEFINED AS
      newUser.isAdmin = true;                               //ENV VAR IN .ENV FILE USING DOTENV PACKAGE
    }
    try{
      let user=await User.register(newUser,req.body.password);
      passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome To Yelpcamp "+user.username);
            res.redirect("/campgrounds");
        });
    }
    catch(err)
    {
            req.flash("error",err.message);//err PROVIDED BY PASSPORT AUTOMATICALLY STORES REGISTER ERROR 
            return res.redirect("/register");
    }
})
//LOGIN ROUTES
//SHOW LOGIN FORM
router.get("/login",function(req, res) {
    res.render("login.ejs",{page:"login"});
})
//LOGIN LOGIC
//2ND ARG IS MIDDLEWARE(WILL CAUSE AUTHENTICATION i.e. CHECK IF USERNAME PASSWORD MATCHES IN DB)
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,     //Setting the failureFlash option to true instructs Passport to flash an error message
        successFlash: 'Welcome back to YelpCamp!'
    }), function(req, res){});

//LOGOUT ROUTE
router.get("/logout",function(req, res) {
    req.logout();
    req.flash("success","Successfully Logged You Out!");
    res.redirect("/campgrounds");
});

// FORGOT PASSWORD
router.get('/forgot', function(req, res) {
  res.render('forgot.ejs');
});
/*Async Waterfall Runs an array of functions in series, each passing their results to the next in the array,if any of the functions pass an error 
to the callback, the next function is not executed and the main callback is immediately called with the error." */

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) { //1ST FUNCTION OF ARRAY
      crypto.randomBytes(20, function(err, buf) {   //GENERATES CRYPTOGRAPHICALLY STRONG PSEUDO-RANDOM DATA()
        var token = buf.toString('hex'); //ENCODES TO HEXDEC
        done(err, token);
      });
    },
    //2ND FUNCTION OF ARRAY
    function(token, done) {     //FINDS USER WHO HAS EMAIL AS GIVEN IN FORGOT PASSWORD FORM 
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 3600000s=1 hour i.e token expires after one hour

        user.save(function(err) { //SAVES PASSWORDTOKEN AND PASSWORDEXPIRES VALUES IN THE USER
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {//3RD FUNCTION OF ARRAY
      var smtpTransport = nodemailer.createTransport({ //NODEMAILER TO SEND MAIL(ANOTHER PACKAGE CALLED MAILGUN IS BETTER OPTION)
        service: 'Gmail', //USING GMAIL
        auth: {
          user: 'rawnked96@gmail.com',     //MAIL WILL BE SENT FROM WHICH ACCOUNT
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {                   //THE MATTER IN SENT MAIL INCLUDING SENDER,RECIPIENT ETC(STORED IN mailOptions Var)
        to: user.email,
        from: 'rawnked96@gmail.com',
        subject: 'YelpCamp Password Reset',
        text: 'You are receiving this because you (or someone else) has requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + req.headers.host + '/reset/' + token + '\n\n' +     //THIS IS RECOVERY LINK(HOST ADDRESS/RESET/TOKEN)
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) { //SEND THE MAIL
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done'); //NO MORE FUNCTIONS IN ARRAY,THERFORE ARGUMENT WHICH IS PASSED TO NEXT FUNCTION IS ARBITARY STRING
      });
    }
  ], function(err) {
    if (err) return next(err);          //IF ERROR OCCURS IN ANY FUNC RUN THIS CALLBACK
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) { //THIS ROUTE IS RECOVERY LINK

//1.FIND USER WHOSE TOKEN VALUE MATCHES THE TOKEN IN ROUTE(WE HAVE resetPasswordToken IN USER MODEL)
/*2.ALSO THE resetPasswordExpires(EQUAL TO TIME WHEN MAIL SENT + 1HR AS SET IN FORGOT POST ROUTE) SHOULD BE GREATER THAN($gt)
    CURRENT TIME(THAT IS RESET TOKEN HAS NOT EXPIRED)  */
    
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset.ejs', {token: req.params.token}); //RENDER RESET FORM
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {  //FIND USER WHOSE TOKEN VALUE MATCHES AND PASSWORDTOKEN HAS NOT EXPIRED
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {   //CHECK IF PASSWORD AND CONFIRM PASSWORD FIELD IN RESET FORM MATCH
          user.setPassword(req.body.password, function(err) { //SETS NEW PASSWORD AS CURRENT PASSWORD
            user.resetPasswordToken = undefined;   //NOW INVALIDATE THE RESET TOKEN
            user.resetPasswordExpires = undefined; //INVALIDATE RESET PASSWORD EXPIRE TIME

            user.save(function(err) {           //SAVE NEW PASSWORD IN USER'S DB
              req.logIn(user, function(err) {  //ALSO LOG IN THE USER WITH NEW PASSWORD AUTOMATICALLY
                done(err, user);
              });
            });
          })
        }
        else      //IF PASSWORD!=CONFIRM PASSWORD FIELD
        {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) { //2ND FUNCTION IN ARRAY(SEND EMAIL THAT PASSWORD HAS BEEN RESET)
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'rawnked96@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'rawnked96@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello From YelpCamp,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {     //ERROR OR NOT REDIRECT TO SHOW PAGE
    res.redirect('/campgrounds');
  });
});


//USER PROFILE
router.get("/users/:id",function(req, res) {
   User.findById(req.params.id).populate("followers").exec(async function(err,foundUser){
     try{
     if(err)
        throw(err);
         let campgrounds=await Campground.find({'author.id':req.params.id});
         res.render("users/show.ejs",{user:foundUser,campgrounds:campgrounds});
       }
       catch(err){
           req.flash("error","Something went Wrong !");
           return res.redirect("back");
       }
   });
});

//EDIT USER PROFILE
router.get("/users/:id/edit",middleware.UserOwnership,async function(req, res) {
  try{
    let foundUser=await User.findById(req.params.id);
    res.render("users/edit.ejs",{user:foundUser});
  }
  catch(err)
  {
      req.flash("error","Something Went Wrong !");
      return res.redirect("/users/"+req.params.id);
  }
});
//UPDATE PROFILE
router.put("/users/:id",middleware.UserOwnership,async function(req,res){
    try
    {
      let user=await User.findOneAndUpdate({_id:req.params.id},req.body,{new:true});
      req.flash("success","User updated Successfully!");
      res.redirect("/users/"+req.params.id);
    }
    catch(err)
    {
           req.flash("error","User Couldn't be Updated!!!");
           return res.redirect("back");
    }
});

//EDIT AVATAR
router.get("/users/:id/avtr/edit",middleware.UserOwnership,async function(req, res) {
  try{
    let foundUser=await User.findById(req.params.id);
    res.render("users/edit_avtr.ejs",{user:foundUser});
  }
  catch(err)
  {
      req.flash("error","Something Went Wrong !");
      return res.redirect("/users/"+req.params.id);
  }
});
//UPDATE AVATAR
router.put("/users/:id/avtr",middleware.UserOwnership,function(req,res){
    User.findById(req.params.id,function(err, foundUser) {
        if(err || !foundUser)
        {
           req.flash("error","User not found !");
           return res.redirect("back");
        }
        User.update(foundUser,{ $set: { avatar:req.body.avatar }},function(err,updateduser){
            if(err)
            {
                req.flash("error","User Couldn't be Updated!!!");
                return res.redirect("back");
            }
            res.redirect("/users/"+req.params.id);
        });
    });
});


// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findByIdAndUpdate(req.params.id,{$addToSet:{followers:req.user._id}});
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/users/' + req.params.id);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } } //DESCENDING ORDER
    }).exec();
    let allNotifications = user.notifications;
    res.render('notifications/index.ejs', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;//ONCE NOT READ,MARK IT AS READ
    notification.save();
    res.redirect(`/campgrounds/${notification.campgroundId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});




module.exports=router;