import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage/LoginPage';
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

const AppRouter = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user/:id" element={<ProfilePage />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/community/:id" element={<CommunityPage />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/community/:id/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} /> 
        <Route path="/profile/edit" element={<UpdateProfile />} />
      </Routes>
  );
};

export default AppRouter;
