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
