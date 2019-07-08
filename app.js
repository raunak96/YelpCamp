//CONFIG DOTENV PACKAGE(WE CAN CAN ADD SENSITIVE DATA TO .ENV FILE,PUT THIS IN .gitignore TO PREVENT FROM UPLOAD TO GITHUB)
require('dotenv').config();//IN OUR CASE,WE HAVE ADDED SECRET KEY OF ADMIN

var express=require("express"),
    app=express(),
    mongoose=require("mongoose"),
    BodyParser=require("body-parser"),//TO USE req.body
    Campground=require("./models/campground.js"),
    Comment=require("./models/comment.js"),
    User=require("./models/user.js"),
    seedDB=require("./seeds.js"),
    
    //PASSPORT JS
    passport=require("passport"),
    localStrategy=require("passport-local"),
    expressSession=require("express-session"),
    
    methodOverride=require("method-override"),
    flash=require("connect-flash");//INSTALLED TO USE FLASH MESSAGES

//REQUIRING ROUTES
var commentRoutes=require("./routes/comments.js"),
    campgroundRoutes=require("./routes/campgrounds.js"),
    authRoutes=require("./routes/index.js");

//seedDB();//flushes the db

app.use(BodyParser.urlencoded({extended:true}));
mongoose.Promise = Promise; //to use async func like .then .catch
app.use(express.static(__dirname+"/public"));        // __dirname gives path of current file
app.use(methodOverride("_method"));
app.use(flash());

var url=process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v10"
mongoose.connect(url, { useNewUrlParser: true });

//REQUIRE MOMENTJs for ADDING TIME OF ADDITION OF COMMENT ETC
app.locals.moment=require("moment");



//PASSPORT CONFIG(FOR USER AUTHENTICATION)
app.use(expressSession({
    secret:"My World is Mine Alone",  //CAN BE ANY STRING(IT IS ENCODED INSIDE)
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());  // THESE TWO LINES REQUIRED TO USE PASSPORT 
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
//ALL APPS WILL NOW CONTAIN REQ.USER(USER LOGGED IN)INFORMATION IN LOCAL VARIABLE currentUser
//REQ.USER SET UP BY PASSPORT HENCE THIS FUNCTION MUST BE WRITTEN AFTER SETTING UP PASSPORT 
app.use(async function(req,res,next){     
  res.locals.currentUser=req.user; 
  
  if(req.user) {
    try {
        //POPULATE USER WITH ALL THOSE NOTIFICATIONS WHICH ARE NOT READ TILL NOW(NEW NOTIFICATIONS ON DROP DOWN)
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();//STORE IN NEWEST FIRST ORDER
    } catch(err) {
      console.log(err.message);
    }
   }
   
  res.locals.error=req.flash("error");
  res.locals.success=req.flash("success");
  res.locals.fail=req.flash("fail");
  next();
});

//SESSIONS ARE A WAY OF TEMPORARILY PERSISTING STATE (DATA) BETWEEN REQUESTS I.E. TO 'REMEMBER' THAT A USER IS LOGGED IN.

//serializeUser FUNCTION TELLS PASSPORT.JS HOW TO GET INFORMATION FROM A USER OBJECT TO STORE IN A SESSION (SERIALIZE) 
passport.serializeUser(User.serializeUser());

//deserializeUser TELLS HOW TO TAKE THAT INFORMATION AND TURN IT BACK INTO A USER OBJECT (DESERIALIZE)
passport.deserializeUser(User.deserializeUser());

//APP CAN USE ALL ROUTES
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes); //MAKES ROUTE PATH FOR ALL CAMPGROUND ROUTES AS /CAMPGROUNDS AS ROOT
app.use(authRoutes);

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("YelpCamp Server has Started");
});