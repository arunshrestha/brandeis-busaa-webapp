const mongoose = require("mongoose");
const Subscriber = require("./job");
const passportLocalMongoose = require("passport-local-mongoose");
const randToken = require("rand-token");

const Schema = mongoose.Schema;
const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "alumni"], default: "student" },
    graduationYear: { type: Number, required: true },
    major: { type: String, required: true },
    job: { type: String },
    company: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: Number, min: 10000, max: 99999 },
    bio: { type: String },
    apiToken: { type: String },
    isAdmin: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  let user = this;
  if (!user.apiToken) {
    user.apiToken = randToken.generate(16);
    next();
  } else {
    next();
  }
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);
