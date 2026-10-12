import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    message:{
        type: String,
        required: true
    },

    type:{
        type: String,
        enum: ['task_assigned', 'attendance_verified', 'project_update', 'general'],
        default: 'general'
    },

    link:{
        type: String
    },

    read:{
        type: Boolean,
        default: false
    },

    timestamp:{
        type: Date,
        default: Date.now
    }
});

notificationSchema.index({
    userId:1,
    read:1,
    timestamp: -1
});

const notificationModel = mongoose.model('Notification', notificationSchema);
export default notificationModel;