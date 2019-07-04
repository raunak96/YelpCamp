//CAMPGROUND ROUTES
var ocdkey = process.env.OCD_API_KEY;
var express=require("express");
var router=express.Router();
var Campground=require("../models/campground.js");
var Notification = require("../models/notification");
var Comment = require("../models/comment");
var User = require("../models/user");

var middleware=require("../middleware");//WE DIDNT DO middleware/index.js AS IT IS A SPECIAL FILENAME ALWAYS INCLUDED WHEN DIRECTORY
                                        //INCLUDED 
//SETUP MAPS NEODEGECODER WITH OPENCAGE
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'opencage',
  httpAdapter: 'https',
  apiKey: ocdkey,
  formatter:null
};

var geocoder = NodeGeocoder(options);

//INDEX ROUTE----SHOWS ALL CAMPGROUNDS(IT IS A ROUTE WHICH SHOWS IN BRIEF ALL DATA)
router.get("/",function(req,res){
    if(req.query.search) //IF SEARCH INVOKED THIS ROUTE
    {
        //escaperegex function defined below
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');//GI MAKES GLOBAL CASE-INSENSITIVE SEARCH POSSIBLE
       
        // GET ALL CAMPGROUNDS FROM DB WHOSE NAME,LOCATION OR AUTHOR NAME FUZZY MATCHES THE QUERY FROM SEARCH
        Campground.find({name:regex},/*{$or: [{name: regex,}, {location: regex}, {"author.username":regex}]},*/ function(err, allCampgrounds){
           if(err)
           {
               req.flash("error","Something Went Wrong");
               res.redirect("/campgrounds");
           } 
           else if(!allCampgrounds.length) 
           {
              return res.render("campgrounds/index.ejs",{campgrounds:allCampgrounds,fail:"No related Campground found!"});
            }
              res.render("campgrounds/index.ejs",{campgrounds:allCampgrounds});
        });
    }
    else
    {
        Campground.find({},function(err,Allcampgrounds){
           if(err)
                res.redirect("back");
            else
                res.render("campgrounds/index.ejs",{campgrounds:Allcampgrounds,page:"campgrounds"});
        });
    }
});

//NEW ROUTE ---- SHOW FORM TO PASS INFORMATION OF DATA TO BE ADDED TO DB(THE PATH: /:NAME/NEW IS CONVENTIONAL NAME FOR NEW ROUTE )
router.get("/new",middleware.isLoggedIn,function(req,res){   
   res.render("campgrounds/new.ejs");                       
});    

//CREATE ROUTE----ADD NEW CAMPGROUND(DATA) TO DB
router.post("/",middleware.isLoggedIn,async function(req,res){   //CONVENTION IS TO HAVE SAME PATH NAME FOR POST AND GET TO WHICH POST REDIRECTS
    // GET DATA FROM FORM AND ADD TO CAMPGROUNDS ARRAY
    var name = req.body.name;
    var price=req.body.price;
    var image = req.body.image;
    var desc = req.body.desc;
    var author = {                              //GET AUTHOR DETAILS
        id: req.user._id,
        username: req.user.username
    };
    //GEOCODE STUFF(FIND LAT AND LNG FROM LOCATION(FORWARD GEOCODING))
   try{
   let data=await geocoder.geocode(req.body.location);
      var lat =     data[0].latitude;
      var lng  =     data[0].longitude;
      var location=  req.body.location;
      var newCampground = {name: name, price:price,image: image, desc: desc,location:location,lat:lat,lng:lng, author:author};
    
    //CREATE A NEW CAMPGROUND AND SAVE TO DB
        let newlyCreated=await Campground.create(newCampground);
        User.findById(req.user._id).populate('followers').exec(async function(err,foundUser){
                if(err || !foundUser)
                {
                    req.flash("error",err.message);
                     return res.redirect("/campgrounds");
                }
                var newNotification = {username: req.user.username,campgroundId: newlyCreated._id};
                for(const follower of foundUser.followers) 
                {
                    try{
                        let newlyNot=await Notification.create(newNotification);
                        follower.notifications.push(newlyNot);
                        follower.save();
                    }
                    catch(err){
                            req.flash("error",err.message);
                            return res.redirect("/campgrounds");
                    }
                }
          });
            res.redirect("/campgrounds/"+newlyCreated._id);
    }
    catch(err)
    {
        req.flash("error",err.message);
        return res.redirect("/campgrounds");
    }
}); 
//SHOW ROUTE----SHOWS MORE INFO ABOUT SELECTED CAMPGROUND(DATA)[PATH CONVENTION AS GIVEN BELOW]
router.get("/:id",function(req, res) {
    
    //FIND THE CAMPGROUND WITH PROVIDED ID(using findById)
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err || !foundCampground)
        {
            req.flash("error","Campground Not found");
            res.redirect("/campgrounds");
        }
        else
            res.render("campgrounds/show.ejs",{campground:foundCampground});   //SHOW THE TEMPLATE WITH THAT CAMPGROUND 
    });
});
//EDIT ROUTE(FORM FOR EDIT)
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req, res) {
    Campground.findById(req.params.id,function(err,foundCampground){
        if(!req.user._id.equals(foundCampground.author.id))
        {
            req.flash("error","You don't have the permission to do that");
            return res.redirect("/campgrounds/"+req.params.id);
        }
        res.render("campgrounds/edit.ejs",{campground:foundCampground});
    });
});
//UPDATE ROUTE
router.put("/:id",middleware.checkCampgroundOwnership,async function(req,res){

     var author = {
        id: req.user._id,
        username: req.user.username
    };
    req.body.campground.author=author;
    //GEOCODE STUFF(FIND LAT AND LNG FROM LOCATION(FORWARD GEOCODING))
    try{
        let data=await geocoder.geocode(req.body.campground.location);
             req.body.campground.lat = data[0].latitude;
             req.body.campground.lng = data[0].longitude;
             
        let updatedCampground=await Campground.findByIdAndUpdate(req.params.id,req.body.campground,{new:true});
                if(!req.user._id.equals(updatedCampground.author.id))
                {
                    req.flash("error","You don't have the permission to do that");
                    return res.redirect("/campgrounds/"+req.params.id);
                }
                else
                    res.redirect("/campgrounds/"+req.params.id);
        }
        catch(err)
        {
            req.flash("error",err.message);
            return res.redirect("/campgrounds/"+req.params.id);
        }
});  
//DESTROY ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership,async function(req,res){
    try{
        let campground=await Campground.findById(req.params.id);
        await Comment.remove({_id: {$in:campground.comments}});
        await Campground.findByIdAndRemove(req.params.id);
        await Notification.findOneAndDelete({campgroundId:req.params.id}); 
        res.redirect("/campgrounds");
    }
    catch(err)
    {
        req.flash("error","Campground could not be deleted");
        res.redirect("back");
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router;