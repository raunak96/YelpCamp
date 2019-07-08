var mongoose=require("mongoose");
//SCHEMA SETUP
var campgroundSchema=new mongoose.Schema({
   name:{type:String ,required:true},
   price:{type:String ,required:true},
   image:String,
   desc:String,
   location:{type:String ,required:true},
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