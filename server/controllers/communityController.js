import Community from '../models/Community.js';
import asyncHandler from '../utils/asyncHandler.js';
import Post from '../models/Post.js';

export const getAllCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find().populate('createdBy');
    res.status(200).json(communities);
});

export const createCommunity = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

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
        createdBy: req.user._id,
        members: [req.user._id],
    });

    res.status(201).json(community);
});

export const getCommunityById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const community = await Community.findById(id)
        .populate('createdBy', 'username email')
        .populate('members', 'username email');

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    const posts = await Post.find({ community: id })
        .populate({ path: 'community', select: 'name _id createdBy' })
        .populate('author', 'username')
        .sort({ createdAt: -1 });

    res.status(200).json({ ...community.toObject(), posts });
});