import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  content: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', commentSchema);
