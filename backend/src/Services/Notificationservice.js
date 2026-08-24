import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function notify({ recipient, actor, type, recipe = null, comment = null }) {
  if (String(recipient) === String(actor)) return null;

  const recipientUser = await User.findById(recipient).select("notificationSettings");
  if (recipientUser && recipientUser.notificationSettings?.[type] === false) return null;

  return Notification.create({ recipient, actor, type, recipe, comment });
}

export async function notifyFollowers({ actor, followerIds, recipe }) {
  if (!followerIds?.length) return;
  const eligible = await User.find({
    _id: { $in: followerIds },
    "notificationSettings.newRecipe": { $ne: false },
  }).select("_id");

  const docs = eligible
    .filter((u) => String(u._id) !== String(actor))
    .map((u) => ({ recipient: u._id, actor, type: "newRecipe", recipe }));

  if (docs.length) await Notification.insertMany(docs);
}

export async function notifyAdmins({ actor, recipe }) {
  const admins = await User.find({
    roles: "admin",
    "notificationSettings.report": { $ne: false },
  }).select("_id");

  const docs = admins
    .filter((a) => String(a._id) !== String(actor))
    .map((a) => ({ recipient: a._id, actor, type: "report", recipe }));

  if (docs.length) await Notification.insertMany(docs);
}