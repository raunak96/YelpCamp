var Campground=require("../models/campground.js");
var Comment=require("../models/comment.js");
var User=require("../models/user.js");

var middlewareObj={};
//CHECK IF ONE ACCESSING CAMPGROUND IS ITS OWNER
middlewareObj.checkCampgroundOwnership=function(req,res,next){
    if(req.isAuthenticated()) //CHECKS IF USER LOGGED IN
    {
        Campground.findById(req.params.id,function(err, foundCampground) {
            if(err || !foundCampground)
            {
                req.flash("error","Campground not found");
                res.redirect("/campgrounds");  //back REDIRECTS TO PAGE FROM WHERE WE CAME
            }
            else
            {
                //use equals coz one is string other is object
                 //CHECKS IF CURRENT USER IS OWNER OF CAMPGROUND OR ADMIN
                if(req.user._id.equals(foundCampground.author.id) || req.user.isAdmin)
                    next(); //FOLLOW PROCEDURE OF ROUTE WHERE MIDDLWARE USED 
                else
                {
                    req.flash("error","You don't have permission to do that");
                    res.redirect('/campgrounds/' + req.params.id);
                }
            }
        });
    }
    else
    {
        req.flash("error","You need to Login first");
        res.redirect("/campgrounds");
    }
}
//CHECKS IF CURRENT USER IS OWNER OF PARTICULAR COMMENT
middlewareObj.checkCommentOwnership=function(req,res,next){
    if(req.isAuthenticated())
    {
        Campground.findById(req.params.id,function(err, foundCampground) {
            if(err || !foundCampground)
            {
                req.flash("error","Campground Not Found");
                res.redirect("/campgrounds");
            }
            else
            {
                Comment.findById(req.params.comment_id,function(err, foundComment) {
                    if(err || !foundComment)
                    {
                        req.flash("error","Comment Not Found");
                        res.redirect("/campgrounds");  //back REDIRECTS TO PAGE FROM WHERE WE CAME
                    }
                    else
                    {
                        //use equals coz one is string other is object
                        //CHECKS IF CURRENT USER IS OWNER OF CAMPGROUND OR ADMIN
                        if(req.user._id.equals(foundComment.author.id) || req.user.isAdmin) 
                            next(); //FOLLOW PROCEDURE OF ROUTE WHERE MIDDLWARE USED 
                        else
                        {
                            req.flash("error","You dont have permission to do that");
                            res.redirect("back");
                        }
                    }
                });
            }
            
        });
    }
    else
    {
        req.flash("error","You need to Login first");
        res.redirect("/campgrounds");
    }
}
middlewareObj.UserOwnership=function(req,res,next){
    if(req.isAuthenticated())
    {
        User.findById(req.params.id,function(err, foundUser) {
            if(err || !foundUser)
            {
                req.flash("error","User Not Found");
                res.redirect("/users/"+req.params.id);  
            }
            else
            {
                if(req.user._id.equals(foundUser._id)) 
                    next(); //FOLLOW PROCEDURE OF ROUTE WHERE MIDDLWARE USED 
                else
                {
                            req.flash("error","You dont have permission to do that");
                            res.redirect("/users/"+req.params.id);
                }   
            }
        });
        
    }
    else
    {
            req.flash("error","You need to Login first");
            res.redirect("/users/"+req.params.id);
    }
}

//IT IS A MIDDLEWARE  WHICH MAKES SURE ONLY THOSE LOGGEDIN CAN MAKE CHANGES OR VIEW SOMETHING(MIDDLEWARE ALWAYS TAKES 3 PARAMETERS)
middlewareObj.isLoggedIn=function(req,res,next){  
    if(req.isAuthenticated())                   //CHECKS IF ALREADY LOGGED IN
        return next();                          //JUST MEANS NO PROBLEM DO WHATEVER SUPPOSED TO BE DONE
    
    req.flash("error","You need to Login first");//IF ONE IS NOT LOGGED IN,THIS FLASH MESSAGE WITH KEY="error" CAN BE USED TO DISPLAY THE
                                                // THE CORRESPONDING MESSAGE AFTER REDIRECTING
    res.redirect("/login");                     //ELSE LOGIN AGAIN OR SIGNUP
}

module.exports=middlewareObj;