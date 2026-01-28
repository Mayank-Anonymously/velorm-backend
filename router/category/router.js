const express = require('express');
const {
	AddCategories,
	GetAllCatgoriesById,
	GetSingleCatgoryById,
	GetAllCategories,
	AddSubCategories,
	GetAllSubCategoriesById,
	GetAllSubCategories,
	EditCategoryById,
	getSubCategoryById,
	updateSubCategoryById,
	deleteSubCategoryById,
} = require('../../controller/categories/category');
const uploadCategoryImage = require('../../multer/categoryMulter');
const uploadSubCategoryImage = require('../../multer/subCategory');
const categoryRouter = express.Router();

categoryRouter.post('/create-category', uploadCategoryImage, AddCategories);
categoryRouter.get('/get-all-categories', GetAllCategories);
categoryRouter.get(
	'/get-filtered-category/:_id',

	GetAllCatgoriesById,
);
categoryRouter.get('/get-single-category-by-id/:_id', GetSingleCatgoryById);
categoryRouter.post(
	'/create-sub-category/:_id',
	uploadSubCategoryImage,
	AddSubCategories,
);
categoryRouter.get('/get-sub-category-by-cat-id/:_id', GetAllSubCategoriesById);
categoryRouter.get('/get-all-sub-category', GetAllSubCategories);
categoryRouter.patch(
	'/edit-category-by-id/:_id',
	uploadCategoryImage,
	EditCategoryById,
);
categoryRouter.get('/get-subcategory-by-id/:id', getSubCategoryById);
categoryRouter.post(
	'/update-subcategory-by-id/:id',
	uploadSubCategoryImage,
	updateSubCategoryById,
);
categoryRouter.get('/delete-subcategory-by-id/:id', deleteSubCategoryById);

module.exports = categoryRouter;
