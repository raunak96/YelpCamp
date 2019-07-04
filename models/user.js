var mongoose=require("mongoose"),
passportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
    username:String,
    password:String,
    avatar:{type:String},
    firstName:String,
    lastName:String,
    email: {type: String, unique: true, required: true},
    about:String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ],
    isAdmin:{type:Boolean,default:false} //ADD ADMIN PROPERTY 
});
UserSchema.plugin(passportLocalMongoose); //ADDS METHODS ASSOCIATED WITH PASSPORT-LOCAL-MONGOOSE PACKAGE REQUIRED FOR USER AUTHENTICATION 

module.exports=mongoose.model("User",UserSchema);