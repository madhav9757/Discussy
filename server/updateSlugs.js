import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';

dotenv.config();

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const updateSlugs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const posts = await Post.find({ slug: { $exists: false } });
    console.log(`Found ${posts.length} posts without slugs`);

    for (let post of posts) {
      let baseSlug = generateSlug(post.title) || 'post';
      let slug = baseSlug;
      let counter = 1;

      while (await Post.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      post.slug = slug;
      await post.save();
      console.log(`Updated: ${post.title} -> ${slug}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateSlugs();
