const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication
  username: { 
    type: String, 
    required: [true, 'Phone number is required'], // Use phone as username
    unique: true,
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v), // Validate 10-digit phone number
      message: 'Invalid phone number format (use 10 digits)'
    }
  },
  password: { 
    type: String, 
    required: true 
  },

  // Rural Patient Demographics
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'] 
  },
  village: { 
    type: String, 
    required: [true, 'Village name is required'] 
  },
  age: { 
    type: Number, 
    required: true,
    min: [1, 'Age must be at least 1 year'] 
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },

  // Medical Data
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  knownConditions: [String], // e.g., ["Diabetes", "Hypertension"]
  currentMedications: [String]
});

// Password hashing (same as before)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method (same as before)
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);