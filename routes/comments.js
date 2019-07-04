/*====================================================================
      COMMENTS ROUTES(DEPENDANT ON PARTICULAR CAMP,HENCE NESTED ROUTE)  '/' PATH HAS BEEN MADE : '/CAMPGROUND/:ID/COMMENTS' FROM APP.JS
  ====================================================================*/
var express=require("express");
var router=express.Router({mergeParams:true}); //ALLOWS PARAMS FROM OTHER FIELS TO BE USED IN COMMENTS("coz /:id is sent from app.js")
var Campground=require("../models/campground.js");
var Comment=require("../models/comment.js");

var middleware=require("../middleware");//WE DIDNT DO middleware/index.js AS index.js IS A SPECIAL FILENAME ALWAYS INCLUDED WHEM DIRECTORY
                                        //INCLUDED
//NEW ROUTE
router.get("/new",middleware.isLoggedIn,function(req, res) { 
    Campground.findById(req.params.id,function(err,foundCampground){
       if(err || !foundCampground)
       {
            req.flash("error","Campground not found");
            res.redirect("/campgrounds");
        }
        else
            res.render("comments/new.ejs",{campground:foundCampground});         
    });
});
//POST ROUTE
router.post("/",middleware.isLoggedIn,function(req,res){
   //STORE THE CAMPGROUND USING ID
   Campground.findById(req.params.id,function(err, foundCampground) {
        if(err || !foundCampground)
        {
            req.flash("error","Campground Not Found");
            res.redirect("/campgrounds");
        }
        else
        {//CREATE A NEW COMMENT
            Comment.create(req.body.comment,function(err,comment){
                if(err)
                {
                    req.flash("error","Something went Wrong");
                    res.redirect("/campgrounds");
                }
                else
                {
                    //ADD USER DETAILS TO AUTHOR FIELD OF COMMENT
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    
                    comment.save();
                    //CONNECT NEW COMMENT TO CAMPGROUND
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success","Successfully Added Comment");
                    res.redirect("/campgrounds/"+req.params.id); //REDIRECT TO SHOW PAGE OF CAMPGROUND
                }
            });
        }
   })
   
});
//EDIT ROUTE(FORM)
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err, foundComment) {
        if(err || !foundComment)
        {
            req.flash("error","Comment Not Found");
            res.redirect("back");
        }
        if(!req.user._id.equals(foundComment.author.id))
        {
            req.flash("error","You don't have the permission to do that");
            return res.redirect("/campgrounds/"+req.params.id);
        }
        else
            res.render("comments/edit.ejs",{campground_id:req.params.id,comment:foundComment});         
    })
});
//UPDATE ROUTE
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
   Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err)
            res.redirect("back");
        if(!req.user._id.equals(updatedComment.author.id))
        {
            req.flash("error","You don't have the permission to do that");
            return res.redirect("/campgrounds/"+req.params.id);
        }
        else
            res.redirect("/campgrounds/"+req.params.id);
   });
});
//DESTROY ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err)
            res.redirect("back");
        else
        {
            req.flash("success","Comment Deleted!");          
            res.redirect("/campgrounds/"+req.params.id); 
        }
    });
});

module.exports=router;