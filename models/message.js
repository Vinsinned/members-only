var mongoose = require('mongoose');
const { DateTime } = require("luxon");  //for date handling

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    title: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    text: {type: String},
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    name: {type: String, required: true}
});

// Virtual for this book instance URL.
MessageSchema
.virtual('url')
.get(function () {
  return '/messages/'+this._id;
});

MessageSchema
.virtual('date')
.get(function () {
  return DateTime.fromJSDate(this.timestamp).toISODate(); //format 'YYYY-MM-DD'
});

// Export model.
module.exports = mongoose.model('Message', MessageSchema);