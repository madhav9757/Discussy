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
    // ✅ Added the category field
    category: {
      type: String,
      trim: true,
      lowercase: true,
      // You might want to add an enum if you have predefined categories
      // enum: ['tech', 'gaming', 'education', 'lifestyle', 'news', 'sports', 'art'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model('Community', communitySchema);