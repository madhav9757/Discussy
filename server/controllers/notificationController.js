import Notification from '../models/Notification.js';
import { io, connectedUsers } from '../server.js';

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to latest 100
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    
    // Emit socket event to update UI in real-time
    const userSocketId = connectedUsers.get(req.user._id.toString());
    if (userSocketId) {
      io.to(userSocketId).emit('notificationsMarkedRead');
    }
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

/**
 * @desc    Create a new notification (used internally, not as a route)
 * @usage   Call this inside events like post reply or like
 * @param   {Object} param0
 */
export const createNotification = async ({ userId, type, message, link = '', relatedUser = null }) => {
  try {
    const newNotification = await Notification.create({
      user: userId,
      type,
      message,
      link,
      relatedUser,
    });

    // Emit real-time notification via Socket.IO
    const userSocketId = connectedUsers.get(userId.toString());
    if (userSocketId) {
      io.to(userSocketId).emit('notification', newNotification);
    }

    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};