import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Community from './models/Community.js';
import Post from './models/Post.js';
import Notification from './models/Notification.js';
import Comment from './models/Comment.js';

dotenv.config();

const ADJECTIVES = ['Sleek', 'Quantum', 'Radical', 'Cyber', 'Salty', 'Hidden', 'Neon', 'Digital', 'Silent', 'Binary'];
const NOUNS = ['Node', 'Void', 'Stream', 'Protocol', 'Surfer', 'Glitch', 'Nexus', 'Engine', 'Pulse', 'Vector'];

const CATEGORIES = ['technology', 'software', 'gaming', 'lifestyle', 'fitness', 'finance', 'music', 'art', 'science', 'education'];

const POST_TOPICS = [
  'How to optimize React performance in 2026',
  'The rise of independent AI-driven communities',
  'Is glassmorphism making a comeback for real?',
  'Why Rust is overtaking C++ in systems programming',
  'Best mechanical keyboard switches for coding',
  'Deep dive into zero-knowledge proofs',
  'Exploring the latest advancements in SpaceX Starship',
  'Why clean code is sometimes overrated',
  'The future of decentralized social networks',
  'Understanding the new CSS grid level 3 features',
  'Coffee vs Tea: The ultimate coder fuel',
  'How to maintain a work-life balance as a solo dev',
  'Top 5 VS Code extensions you didnt know you needed',
  'Building a custom OS from scratch: Part 1',
  'Dark mode vs Light mode: The scientific consensus',
  'Securing your home lab from port scanners',
  'My journey into open-source contribution',
  'The hidden costs of serverless architecture',
  'Functional programming: Why it changed my life',
  'Designing for accessibility in modern web apps'
];

const COMMENT_PHRASES = [
  "This is exactly what I was looking for!",
  "Great point, but have you considered...",
  "I completely disagree. In my experience...",
  "Thanks for sharing, really helpful.",
  "LOL context is everything though.",
  "Can someone explain this in simpler terms?",
  "Bookmarked. This is gold.",
  "I tried this and it worked perfectly.",
  "Wait, does this work on mobile too?",
  "Interesting perspective, keep it up!",
  "Big if true.",
  "I had the same issue last week, fixed it by...",
  "Does anyone have a link to the original source?",
  "Underrated comment right here.",
  "This escalated quickly."
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/discussly';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Clear DB
    await User.deleteMany({});
    await Community.deleteMany({});
    await Post.deleteMany({});
    await Notification.deleteMany({});
    await Comment.deleteMany({});
    
    console.log('🧹 Database purged. Regenerating nodes...');

    // 1. Create 10 Users
    const createdUsers = [];
    const passwordHash = await bcrypt.hash('password', 10);
    
    for (let i = 1; i <= 10; i++) {
      const username = ADJECTIVES[i-1].toLowerCase() + '_' + NOUNS[Math.floor(Math.random()*NOUNS.length)].toLowerCase() + i;
      const user = await User.create({
        username,
        email: `${username}@discuss.ly`,
        passwordHash,
        bio: `Professional ${NOUNS[Math.floor(Math.random()*NOUNS.length)]} and enthusiast of all things ${CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)]}.`,
      });
      createdUsers.push(user);
    }
    console.log(`👥 ${createdUsers.length} Users seeded`);

    // 2. Create 10 Communities
    const createdCommunities = [];
    for (let i = 0; i < 10; i++) {
      const category = CATEGORIES[i];
      const name = category + '_hacks';
      const community = await Community.create({
        name,
        description: `Everything you need to know about ${category} and more. Joined by experts.`,
        category,
        createdBy: createdUsers[i % 10]._id,
        members: createdUsers.slice(0, 5 + Math.floor(Math.random()*5)).map(u => u._id),
      });
      createdCommunities.push(community);
      
      // Update members
      for (const memberId of community.members) {
        await User.findByIdAndUpdate(memberId, { $addToSet: { joinedCommunities: community._id } });
      }
    }
    console.log(`🌐 ${createdCommunities.length} Communities (Hubs) seeded`);

    // 3. Create 20 Posts
    const createdPosts = [];
    for (let i = 0; i < 20; i++) {
        const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const community = createdCommunities[Math.floor(Math.random() * createdCommunities.length)];
        
        // Random upvotes (2-8 per post)
        const upvoteUsers = createdUsers.slice(0, 2 + Math.floor(Math.random() * 7)).map(u => u._id);
        
        const post = await Post.create({
          title: POST_TOPICS[i],
          content: `This is a detailed discussion about ${POST_TOPICS[i]}. I've been researching this for a while and found some interesting points. Let's discuss!`,
          author: author._id,
          community: community._id,
          upvotes: upvoteUsers,
        });
        createdPosts.push(post);
    }
    console.log(`📝 ${createdPosts.length} Posts seeded`);

    // 4. Create 100+ Comments (Nested)
    let totalComments = 0;
    for (const post of createdPosts) {
      const numRootComments = 3 + Math.floor(Math.random() * 4); // 3-6 root comments
      
      for (let j = 0; j < numRootComments; j++) {
        const rootUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const rootComment = await Comment.create({
          postId: post._id,
          content: COMMENT_PHRASES[Math.floor(Math.random() * COMMENT_PHRASES.length)],
          createdBy: rootUser._id,
          upvotes: createdUsers.slice(0, Math.floor(Math.random() * 5)).map(u => u._id)
        });
        totalComments++;

        // Add 1-2 replies to some root comments
        if (Math.random() > 0.4) {
          const numReplies = 1 + Math.floor(Math.random() * 2);
          for (let k = 0; k < numReplies; k++) {
            const replyUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const reply = await Comment.create({
              postId: post._id,
              parentId: rootComment._id,
              content: `Replying to root: ${COMMENT_PHRASES[Math.floor(Math.random() * COMMENT_PHRASES.length)]}`,
              createdBy: replyUser._id,
              upvotes: createdUsers.slice(0, Math.floor(Math.random() * 3)).map(u => u._id)
            });
            totalComments++;
            
            // Add a 3rd level reply to some level 2 replies
            if (Math.random() > 0.7) {
              const deepReplyUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
              await Comment.create({
                postId: post._id,
                parentId: reply._id,
                content: `Deep dive: ${COMMENT_PHRASES[Math.floor(Math.random() * COMMENT_PHRASES.length)]}`,
                createdBy: deepReplyUser._id
              });
              totalComments++;
            }
          }
        }
      }
    }
    console.log(`💬 ~${totalComments} Comments (including nested) seeded`);

    // 5. System Notification
    await Notification.create({
      user: createdUsers[0]._id,
      type: 'system',
      message: 'Global synchronization complete. Data matrices populated.',
      link: '/explore'
    });

    console.log('SUCCESS: Seed process terminating gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEED_ERR:', error);
    process.exit(1);
  }
}

seedDB();
