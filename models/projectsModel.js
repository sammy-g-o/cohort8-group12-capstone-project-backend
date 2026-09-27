import mongoose from 'mongoose' ;

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true, },
    status: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

const projectsModel = mongoose.model('Project', projectSchema);
export default projectsModel;