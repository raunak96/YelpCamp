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
router.get("/new",middleware.isLoggedIn,async function(req, res) {
    try
    {
        let foundCampground=await Campground.findById(req.params.id);
        res.render("comments/new.ejs",{campground:foundCampground});         
    }
    catch(err)
    {
        req.flash("error","Campground not found");
        res.redirect("/campgrounds");
    }
});
//POST ROUTE
router.post("/",middleware.isLoggedIn,async function(req,res){
   //STORE THE CAMPGROUND USING ID
   try{
        let foundCampground=await Campground.findById(req.params.id);
        if(!foundCampground)
        {
            req.flash("error","Campground Not Found");
            return res.redirect("/campgrounds");
        }
        let comment=await Comment.create(req.body.comment);
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
   catch(err)
   {
            req.flash("error","Something Went Wrong!");
            res.redirect("/campgrounds");
   }
});
//EDIT ROUTE(FORM)
router.get("/:comment_id/edit",middleware.checkCommentOwnership,async function(req,res){
    try
    {
        let foundComment=await Comment.findById(req.params.comment_id);   
        res.render("comments/edit.ejs",{campground_id:req.params.id,comment:foundComment});         
    }
    catch(err){
            req.flash("error",err.message);
            res.redirect("back");
    }
});
//UPDATE ROUTE
router.put("/:comment_id",middleware.checkCommentOwnership,async function(req,res){
    try
    {
        await Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,{new:true});
        res.redirect("/campgrounds/"+req.params.id);
    }
    catch(err){
        req.flash("error","Comment could not be updated");
        return res.redirect("back");
    }
});
//DESTROY ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership,async function(req, res) {
    try
    {
        await Comment.findByIdAndRemove(req.params.comment_id);
        req.flash("success","Comment Deleted!");          
        return res.redirect("/campgrounds/"+req.params.id); 
    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("back");
    }
        
});

module.exports=router;