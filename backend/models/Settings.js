const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Helper: get a setting by key
settingsSchema.statics.get = async function (key, defaultValue = null) {
  const doc = await this.findOne({ key });
  return doc ? doc.value : defaultValue;
};

// Helper: set a setting by key
settingsSchema.statics.set = async function (key, value) {
  return this.findOneAndUpdate(
    { key },
    { key, value, updatedAt: Date.now() },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Settings', settingsSchema);
