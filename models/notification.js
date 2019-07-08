var mongoose = require("mongoose");

var notificationSchema = new mongoose.Schema({
	username: String,
	campgroundId: String,
	createdAt: { type: Date, default: Date.now },
	isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);