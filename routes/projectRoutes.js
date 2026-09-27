import express from 'express';
import projectsModel from '../models/projectsModel';

const projectRoute = express.Router();
projectRoute.post('/projects', );
projectRoute.get('/projects', getProjects);
projectRoute.get('/projects/:id', getProjectsById);

export default projectRoute;