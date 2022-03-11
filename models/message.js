var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    title: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    text: {type: String, required: true},
    user: [{ type: Schema.ObjectId, ref: 'User', required: true }]
});

// Virtual for this book instance URL.
MessageSchema
.virtual('url')
.get(function () {
  return '/messages/'+this._id;
});

// Export model.
module.exports = mongoose.model('Message', MessageSchema);