import express from 'express';
import projectsModel from '../models/projectsModel';

const projectRoute = express.Router();
projectRoute.post('/projects', createProjects);
projectRoute.get('/projects', getProjects);
projectRoute.get('/projects/:id', getProjectsById);

export default projectRoute;