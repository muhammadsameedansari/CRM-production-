import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.FATIQ,
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    phone: { type: String, default: '' },
    stats: {
      leadsAdded: { type: Number, default: 0 },
      meetingsBooked: { type: Number, default: 0 },
      dealsClosed: { type: Number, default: 0 },
      revenueGenerated: { type: Number, default: 0 },
      tasksCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
