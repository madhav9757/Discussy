import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Community from './models/Community.js';
import Post from './models/Post.js';
import Notification from './models/Notification.js';
import Comment from './models/Comment.js';

dotenv.config();

const users = [
  { username: 'admin_sys', email: 'sys@discuss.ly', password: 'password', bio: 'System Administrator Node' },
  { username: 'cyber_punk', email: 'cpunk@discuss.ly', password: 'password', bio: 'Rogue AP Tracker / Code Optimizer' },
  { username: 'net_runner', email: 'net@discuss.ly', password: 'password', bio: 'Scraping the deep data flows.' },
];

const communities = [
  { name: 'general', description: 'Main broadcast channel for system operators.', category: 'technology' },
  { name: 'development', description: 'Code architecture, refactoring, and logic matrices.', category: 'software' },
  { name: 'hardware', description: 'Silicon node telemetry and overclock vectors.', category: 'hardware' },
];

const posts = [
  { title: 'SYS_UPDATE_v1.0.4', content: 'The node has synchronized successfully. All pipelines are green.' },
  { title: 'Optimizing Matrix Inversions', content: 'Has anyone discovered a better approach to O(n) rendering for vast 3D arrays? Im finding severe performance bottlenecks when traversing deeper trees.' },
  { title: 'Silicon Temperature Variance', content: 'My primary chip is running at 94c during full compilation loads. Is this within the safe parameter bounds?' },
  { title: 'Rogue Data Packets Detected', content: 'Watching my port monitors and noticing unusual traffic from unregistered APs. Shielding is up but stay alert.' },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear DB
    await User.deleteMany({});
    await Community.deleteMany({});
    await Post.deleteMany({});
    await Notification.deleteMany({});
    await Comment.deleteMany({});
    
    console.log('🧹 Existing data purged');

    // Create Users
    const createdUsers = [];
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = await User.create({
        username: u.username,
        email: u.email,
        passwordHash,
        bio: u.bio,
      });
      createdUsers.push(user);
    }
    console.log('👥 Users seeded');

    // Create Communities
    const adminId = createdUsers[0]._id;
    const createdCommunities = [];
    for (const c of communities) {
      const community = await Community.create({
        ...c,
        createdBy: adminId,
        members: createdUsers.map(u => u._id),
      });
      createdCommunities.push(community);
      
      // Update users joinedCommunities
      for (const u of createdUsers) {
        u.joinedCommunities.push(community._id);
        await u.save();
      }
    }
    console.log('🌐 Subnets (Communities) seeded');

    // Create Posts
    for (let i = 0; i < posts.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      const community = createdCommunities[i % createdCommunities.length];
      
      await Post.create({
        title: posts[i].title,
        content: posts[i].content,
        author: author._id,
        community: community._id,
        upvotes: [adminId], // initial upvote
      });
    }
    console.log('📝 POST logs (Posts) seeded');

    // Add a Notification for the first user
    await Notification.create({
      user: adminId,
      type: 'system',
      message: 'System initialization complete. Database seeded with dummy nodes.',
      link: '/explore'
    });

    console.log('SUCCESS: Seed process terminating gracefully.');
    process.exit();
  } catch (error) {
    console.error('❌ SEED_ERR:', error);
    process.exit(1);
  }
}

seedDB();
