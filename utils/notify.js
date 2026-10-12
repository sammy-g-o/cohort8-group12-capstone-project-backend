import notificationModel from "../models/notificationModel.js";

export const createNotification = async (userId, message, { type = 'general', link } = {}) => {
    try {
        return await notificationModel.create({ userId, message, type, link });
    } catch (error) {
        console.error('createNotification failed:',  error.message);
    }
};

export const notifyMany = async (userIds, message, options ={}) => {
    try {
        const docs = userIds.map(userId => ({
            userId,
            message,
            type: options.type || 'general',
            link: options.link
        }));
        return await notificationModel.insertMany(docs);
    } catch (error) {
        console.error('notifyMany failed:', error.message);
    }
}