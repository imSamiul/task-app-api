const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: {
      type: Number,
      default: 0,
      validate: (value) => {
        if (value < 0) {
          throw new Error('Age must be a positive number');
        }
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 7,
      validate: (value) => {
        if (validator.contains(value.toLowerCase(), 'password')) {
          throw new Error("Password shouldn't contain the word 'password'");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true },
);

//
userSchema.virtual('tasks', {
  ref: 'tasks',
  localField: '_id',
  foreignField: 'owner',
});

//
userSchema.methods.toJSON = function toJSON() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

//
userSchema.methods.generateAuthToken = async function generateAuthToken() {
  const user = this;

  // ... rest of your logic to generate and store the token (uncommented)
  const token = jwt.sign({ id: user.id.toString() }, process.env.JWT_TOKEN);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//
userSchema.statics.findByCredentials = async function findByCredentials(
  email,
  password,
) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error('unable to login');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('unable to login');
  }
  return user;
};

// set the middleware up for hashing password before saving
userSchema.pre('save', async function hashPassword(next) {
  const user = this; // this gives to individual user that i will save
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user tasks when user is removed
userSchema.statics.deleteByIdAndDeleteTasks =
  async function deleteByIdAndDeleteTasks(id) {
    // Delete the tasks
    await Task.deleteMany({ owner: id });

    // Delete the user
    const user = await this.findByIdAndDelete(id);

    return user;
  };

const User = mongoose.model('users', userSchema);
module.exports = User;
