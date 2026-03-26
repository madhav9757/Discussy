// server/models/Community.js
import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Text index for search
communitySchema.index({ name: 'text', description: 'text', category: 'text' });

// Regular indexes
communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ createdBy: 1 });

export default mongoose.model('Community', communitySchema);