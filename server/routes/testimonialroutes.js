import express from 'express';
import { addTestimonial, getTestimonials } from '../controllers/testimonialcontroller.js';


const testimonialRouter = express.Router();

testimonialRouter.get('/all', getTestimonials);
testimonialRouter.post('/add', addTestimonial);

export default testimonialRouter;