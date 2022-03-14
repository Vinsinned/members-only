var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: { type: String, required: true, minLength: 1, maxLength: 100 },
    lastName: { type: String, required: true, minLength: 1, maxLength: 100 },
    username: { type: String, required: true },
    password: { type: String },
    memberStatus: { type: Boolean, required: true, default: false },
    adminStatus: { type: Boolean, required: true, default: false }
});

// Virtual for this genre instance URL.
UserSchema
.virtual('url')
.get(function () {
  return '/users/'+this._id;
});

UserSchema
.virtual('name')
.get(function () {
  return this.firstName + ' ' + this.lastName;
});

// Export model.
module.exports = mongoose.model('User', UserSchema);