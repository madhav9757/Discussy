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

// Import the new ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute'; // Adjust path as needed

// Import the new NotFoundPage component
import NotFoundPage from './pages/PageNotFound/NotFoundPage.jsx'; // Adjust path as needed

// Optional: Example of lazy loading for performance (uncomment and use if desired)
// const LoginPage = React.lazy(() => import('./features/auth/LoginPage/LoginPage'));
// const RegisterPage = React.lazy(() => import('./features/auth/RegisterPage/RegisterPage'));
// const Home = React.lazy(() => import('./pages/home/Home'));
// ... and so on for other components
// If using lazy loading, remember to wrap your <Routes> with <Suspense fallback={<div>Loading...</div>}> in App.jsx

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes - Accessible to everyone */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/user/:id" element={<ProfilePage />} /> {/* Public view of profiles */}
      <Route path="/community/:id" element={<CommunityPage />} />
      <Route path="/posts/:id" element={<PostDetails />} />

      {/* Protected Routes - Accessible only to authenticated users */}
      {/* All routes nested within this <Route> will require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} /> {/* User's own profile */}
        <Route path="/profile/edit" element={<UpdateProfile />} />
        <Route path="/community/:id/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} />
      </Route>

      {/* Catch-all route for 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;