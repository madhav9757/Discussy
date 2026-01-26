// client/src/router.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import all your page/feature components
import LoginPage from './features/auth/LoginPage/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage/RegisterPage';
import Home from './pages/home/Home';
import ProfilePage from './features/auth/profile/ProfilePage.jsx';
import Explore from './pages/explore/Explore';
import CommunityPage from './pages/Community/CommunityPage.jsx';
import PostDetails from './pages/Post/PostDetails.jsx';
import AboutPage from './pages/About/AboutPage.jsx';
import CreatePost from './features/posts/createPost/CreatePost.jsx';
import EditPostPage from './features/posts/updatePost/UpdatePost.jsx';
import UpdateProfile from './features/auth/profile/updateProfile/UpdateProfile.jsx';
import NotificationsPage from './pages/notifications/NotificationsPage.jsx';
import CommunitiesPage from './pages/Community/communityRoute/CommunitiesPage.jsx';
import CreateCommunityPage from './features/communities/creatCommunity/CreateCommunityPage.jsx';
import SearchResultsPage from './pages/search/SearchResultsPage.jsx'; // ✅ NEW

import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/PageNotFound/NotFoundPage.jsx';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes - Accessible to everyone */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/search" element={<SearchResultsPage />} /> {/* ✅ NEW */}
      <Route path="/community" element={<CommunitiesPage />} />
      <Route path="/create-community" element={<CreateCommunityPage />} />
      <Route path="/user/:id" element={<ProfilePage />} />
      <Route path="/community/:id" element={<CommunityPage />} />
      <Route path="/posts/:id" element={<PostDetails />} />

      {/* Protected Routes - Accessible only to authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<UpdateProfile />} />
        <Route path="/new-post" element={<CreatePost />} />
        <Route path="/community/:id/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Catch-all route for 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;