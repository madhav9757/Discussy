import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Standardizing Dicebear version to 9.x as 7.x may be deprecated or slower
const DICEBEAR_USER_URL = "https://api.dicebear.com/9.x/notionists/svg";
const DICEBEAR_COMM_URL = "https://api.dicebear.com/9.x/identicon/svg";

export function getAvatarUrl(user) {
  if (!user) return `${DICEBEAR_USER_URL}?seed=anon`;

  const image = user.image;
  if (image && typeof image === "string" && image.trim() !== "") {
    // If it's a full URL, return as is
    if (image.startsWith("https")) return image;

    // Ensure relative path has leading slash for correct concatenation
    const path = image.startsWith("/") ? image : `/${image}`;
    return `${API_BASE_URL}${path}`;
  }

  // Clean fallback
  return `${DICEBEAR_USER_URL}?seed=${user.username || "anon"}`;
}

export function getUserBannerUrl(user) {
  if (!user || !user.bannerImage) return null;

  const image = user.bannerImage;
  if (image && typeof image === "string" && image.trim() !== "") {
    if (image.startsWith("https")) return image;

    const path = image.startsWith("/") ? image : `/${image}`;
    return `${API_BASE_URL}${path}`;
  }
  return null;
}

export function getCommunityIconUrl(community) {
  if (!community)
    return `${DICEBEAR_COMM_URL}?seed=anon&backgroundColor=transparent`;

  const image = community.image;
  if (image && typeof image === "string" && image.trim() !== "") {
    // If it's a full URL, return as is
    if (image.startsWith("https")) return image;

    // Ensure relative path has leading slash
    const path = image.startsWith("/") ? image : `/${image}`;
    return `${API_BASE_URL}${path}`;
  }

  return `${DICEBEAR_COMM_URL}?seed=${community.name || "anon"}&backgroundColor=transparent`;
}

export function getCommunityBannerUrl(community) {
  if (!community || !community.bannerImage) return null;

  const image = community.bannerImage;
  if (image && typeof image === "string" && image.trim() !== "") {
    if (image.startsWith("https")) return image;

    const path = image.startsWith("/") ? image : `/${image}`;
    return `${API_BASE_URL}${path}`;
  }
  return null;
}
