import Notification from "../models/Notification.js";

// GET /api/notifications (auth)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("actor", "name profilePicture isOfficial")
      .populate("recipe", "title")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

// GET /api/notifications/unread-count (auth)
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to load unread count" });
  }
};

// PUT /api/notifications/:id/read (auth)
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    notification.read = true;
    await notification.save();
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// PUT /api/notifications/read-all (auth)
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { $set: { read: true } });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};