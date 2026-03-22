import Community from '../models/Community.js';
import asyncHandler from '../utils/asyncHandler.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

export const getAllCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find().populate('createdBy');
    res.status(200).json(communities);
});

export const createCommunity = asyncHandler(async (req, res) => {
    // ✅ Destructure 'category' from req.body
    const { name, description, category } = req.body; 

    if (!name) {
        res.status(400);
        throw new Error('Community name is required');
    }

    const nameExists = await Community.findOne({ name: name.toLowerCase() });

    if (nameExists) {
        res.status(400);
        throw new Error('Community name already exists');
    }

    const community = await Community.create({
        name,
        description,
        category, // ✅ Include category when creating the community
        createdBy: req.user._id,
        members: [req.user._id],
    });

    res.status(201).json(community);
});

export const getCommunityById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const idOrName = decodeURIComponent(id);

    // Regex to check for a valid MongoDB ObjectId (24 hex characters)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrName);

    const query = isObjectId ? { _id: idOrName } : { name: idOrName.toLowerCase() };

    const community = await Community.findOne(query)
        .populate('createdBy', 'username email')
        .populate('members', 'username email');

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    const posts = await Post.find({ community: community._id })
        .populate({ path: 'community', select: 'name _id createdBy' })
        .populate('author', 'username')
        .sort({ createdAt: -1 });

    res.status(200).json({ ...community.toObject(), posts });
});


export const joinCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const idOrName = decodeURIComponent(id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrName);
    const query = isObjectId ? { _id: idOrName } : { name: idOrName.toLowerCase() };

    const community = await Community.findOne(query);
    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    const user = await User.findById(req.user._id);

    if (community.members.includes(req.user._id)) {
        res.status(400);
        throw new Error('Already a member of this community');
    }

    community.members.push(req.user._id);
    user.joinedCommunities.push(community._id);

    await community.save();
    await user.save();

    res.status(200).json({ message: 'Joined community successfully' });
});


export const leaveCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const idOrName = decodeURIComponent(id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrName);
    const query = isObjectId ? { _id: idOrName } : { name: idOrName.toLowerCase() };

    const community = await Community.findOne(query);
    const user = await User.findById(req.user._id);
    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    const index = community.members.indexOf(req.user._id);
    if (index === -1) {
        res.status(400);
        throw new Error('You are not a member of this community');
    }

    community.members.splice(index, 1);
    user.joinedCommunities.pull(community._id);

    await community.save();
    await user.save();

    res.status(200).json({ message: 'Left community successfully' });
});

export const deleteCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const idOrName = decodeURIComponent(id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrName);
    const query = isObjectId ? { _id: idOrName } : { name: idOrName.toLowerCase() };

    const community = await Community.findOne(query);
    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    // Only the creator can delete
    if (community.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the creator can delete this community');
    }

    // Delete all posts in this community
    await Post.deleteMany({ community: id });

    // Delete the community
    await community.deleteOne();

    res.status(200).json({ message: 'Community deleted successfully' });
});