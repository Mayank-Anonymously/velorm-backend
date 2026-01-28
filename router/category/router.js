const express = require('express');
const {
	AddCategories,
	GetAllCategories,
	GetSingleCategoryById,
	EditCategoryById,
	DeleteCategoryById,
} = require('../../controller/categories/category');

const uploadCategoryImage = require('../../multer/categoryMulter');

const categoryRouter = express.Router();

/**
 * CREATE CATEGORY
 */
categoryRouter.post('/create-category', uploadCategoryImage, AddCategories);

/**
 * GET ALL CATEGORIES
 */
categoryRouter.get('/get-all-categories', GetAllCategories);

/**
 * GET SINGLE CATEGORY BY ID
 */
categoryRouter.get('/get-single-category-by-id/:_id', GetSingleCategoryById);

/**
 * EDIT CATEGORY BY ID
 */
categoryRouter.patch(
	'/edit-category-by-id/:_id',
	uploadCategoryImage,
	EditCategoryById,
);

/**
 * DELETE CATEGORY BY ID
 */
categoryRouter.delete('/delete-category-by-id/:_id', DeleteCategoryById);

module.exports = categoryRouter;
