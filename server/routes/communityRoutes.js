import {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
  updateCommunity,
} from "../controllers/communityController.js";
import { protect } from "../middleware/auth.js";
import express from "express";

const router = express.Router();

router.get("/", getAllCommunities);
router.post("/", protect, createCommunity);
router
  .route("/:id")
  .get(getCommunityById)
  .delete(protect, deleteCommunity)
  .put(protect, updateCommunity);
router.post("/:id/join", protect, joinCommunity);
router.post("/:id/leave", protect, leaveCommunity);

export default router;
