var mongoose=require("mongoose");
//SCHEMA SETUP
var commentSchema=new mongoose.Schema({
   text:String,
   createdAt: { type: Date, default: Date.now }, //ADD TIME ADDED PROPERTY
   author:  { 
               id:{
                     type:mongoose.Schema.Types.ObjectId,
                     ref:"User"
                  },
               username:String
            }
});

module.exports=mongoose.model("Comment",commentSchema);