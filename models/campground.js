var mongoose=require("mongoose");
//SCHEMA SETUP
var campgroundSchema=new mongoose.Schema({
   name:String,
   price:String,
   image:String,
   desc:String,
   location:String,
   lat: Number,
   lng: Number,
   createdAt: { type: Date, default: Date.now }, //ADDED TIME ADDED PROPERTY 
   author:  {
                id:{type:mongoose.Schema.Types.ObjectId ,ref:"User" },
                username:String
            },
   comments:
        [
            {   type:mongoose.Schema.Types.ObjectId,
                ref:"Comment"}                        //REFERENCING COMMENT MODEL
        ]
});

module.exports=mongoose.model("Campground",campgroundSchema);