import Notification from '../models/Notification.js';

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
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

/**
 * @desc    Create a new notification (used internally, not as a route)
 * @usage   Call this inside events like post reply or like
 * @param   {Object} param0
 */
export const createNotification = async ({ userId, type, message, link = '' }) => {
  try {
    const newNotification = await Notification.create({
      user: userId,
      type,
      message,
      link,
    });
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
