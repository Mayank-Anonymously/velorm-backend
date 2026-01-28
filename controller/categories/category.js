const categoryinstance = require('../../model/categories');
const { subcategoryinstance } = require('../../model/subcategories');

const AddCategories = async (req, res) => {
	try {
		const { categoryName, subCategory, status, categoryDescription, type } =
			req.body;

		const newCategory = new categoryinstance({
			categoryName,
			categoryDescription,
			categoryImage: req.file.filename,
			subCategory: JSON.parse(subCategory),
			status: JSON.parse(status),
			type,
		});

		const ifAlradyExist = categoryinstance.find({ categoryName });

		if (ifAlradyExist.length >= 1) {
			res.status(422).json({
				message: 'Category With This Name Already Exist',
				status: 0,
			});
		} else if (categoryName !== '' && status !== '') {
			await newCategory.save();
			res.status(200).json({ message: 'Created Successfuly', status: 1 });
		} else {
			res.status(400).json({ message: 'Bad Request', status: 0 });
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

const AddSubCategories = async (req, res) => {
	const { _id } = req.params;
	const { subCategoryName, subSubCategory, status, subCategoryDescription } =
		req.body;

	try {
		const newCategory = {
			subCategoryName,
			subCategoryDescription,
			subCategoryImage: req.file.filename,
			subSubCategory: JSON.parse(subSubCategory),
			status: JSON.parse(status),
		};

		const ifAlradyExist = await subcategoryinstance.find({
			subCategoryName,
		});

		const updatedCategory = await categoryinstance.findOneAndUpdate(
			{ _id: _id },
			{ $push: { subCategory: newCategory } },
			{ new: true }, // This option returns the modified document
		);

		if (ifAlradyExist.length == 1) {
			res.status(422).json({
				message: 'Category With This Name Already Exist',
				status: 0,
			});
		} else if (updatedCategory !== null) {
			res.status(200).json({ message: 'Created Successfuly', status: 1 });
		} else {
			res.status(400).json({ message: 'Bad Request', status: 0 });
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};
const AddSubSubCategories = async (req, res) => {
	const { _id } = req.params;
	const { subSubCategoryName, status, subSubCategoryDescription } = req.body;

	try {
		const newCategory = {
			subSubCategoryName,
			subSubCategoryDescription,
			subSubCategoryImage: req.file.filename,
			status: JSON.parse(status),
		};

		// const ifAlradyExist = await subcategoryinstance.find({
		//   subCategoryName,
		// });

		const updatedCategory = await subcategoryinstance.findOneAndUpdate(
			{ _id: _id },
			{ $push: { subSubCategory: newCategory } },
			{ new: true }, // This option returns the modified document
		);
		if (updatedCategory !== null) {
			res.status(200).json({ message: 'Created Successfuly', status: 1 });
		} else {
			res.status(400).json({ message: 'Bad Request', status: 0 });
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

const GetAllCategories = async (req, res) => {
	console.log('AI called');
	try {
		const FindAll = await categoryinstance.find({});
		// const FindAll = await categoryinstance.find({});
		if (FindAll.length !== null) {
			res.status(200).json({
				baseResponse: { message: 'Categories Fetched', status: 1 },
				response: FindAll,
			});
		} else {
			res.status(400).json({
				baseResponse: { message: 'No categories Found', status: 0 },
				response: FindAll,
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};
const GetAllSubCategories = async (req, res) => {
	try {
		var subcat = [];
		const FindAll = await categoryinstance.find({});
		FindAll.forEach((element) => subcat.push(...element.subCategory));

		// const FindAll = await categoryinstance.find({});
		if (subcat.length !== null || subcat.length !== 0) {
			res.status(200).json({
				baseResponse: { message: 'Categories Fetched', status: 1 },
				response: subcat,
			});
		} else {
			res.status(400).json({
				baseResponse: { message: 'No categories Found', status: 0 },
				response: subcat,
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

const GetAllSubCategoriesById = async (req, res) => {
	const { _id } = req.params;
	try {
		const FindAll = await categoryinstance.findOne({ _id: _id });
		// const FindAll = await categoryinstance.find({});
		const subCat = FindAll.subCategory;
		if (FindAll.length !== null) {
			res.status(200).json({
				baseResponse: { message: 'Sub Categories Fetched', status: 1 },
				response: FindAll.subCategory,
			});
		} else {
			res.status(400).json({
				baseResponse: { message: 'No categories Found', status: 0 },
				response: FindAll,
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};
const GetAllCatgoriesById = async (req, res) => {
	const { _id } = req.params;
	try {
		const FindAll = await categoryinstance.find({ _id: _id });

		if (FindAll.length !== 0) {
			res.status(200).json({
				baseResponse: { message: 'Categories Fetched', status: 1 },
				response: FindAll,
			});
		} else {
			res.status(400).json({ message: 'Bad Request', status: 0 });
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

const GetSingleCatgoryById = async (req, res) => {
	const { _id } = req.params;
	try {
		const FindOne = await categoryinstance.findOne({ _id: _id });

		if (FindOne.length !== 0) {
			res.status(200).json({
				baseResponse: { message: 'Categories Fetched', status: 1 },
				response: FindOne,
			});
		} else {
			res.status(400).json({ message: 'Bad Request', status: 0 });
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

const EditCategoryById = async (req, res) => {
	const { _id } = req.params;

	console.log(req.body);
	try {
		const { categoryName, categoryDescription, status } = req.body;

		const ifExist = await categoryinstance.findOneAndUpdate(
			{ _id: _id },
			{
				categoryName: categoryName,
				categoryImage: req.file.filename,
				categoryDescription: categoryDescription,
				status: status,
			},
		);

		if (ifExist) {
			res
				.status(200)
				.json({ baseResponse: { message: 'Updated Successfuly', status: 1 } });
		} else {
			res
				.status(400)
				.json({ baseResponse: { message: 'Bad Request', status: 0 } });
		}
	} catch (error) {
		res
			.status(500)
			.json({ baseResponse: { message: error.message, status: 0 } });
	}
};

const DeleteCategoryById = async (req, res) => {
	try {
		const { _id } = req.params;

		const ifExist = await categoryinstance.deleteOne({ _id: _id });

		if (ifExist) {
			res
				.status(200)
				.json({ baseResponse: { message: 'Deleted Successfuly', status: 1 } });
		} else {
			res
				.status(400)
				.json({ baseResponse: { message: 'Bad Request', status: 0 } });
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

const getSubCategoryById = async (req, res) => {
	const { id } = req.params;
	try {
		const category = await categoryinstance.findOne({
			subCategory: {
				$elemMatch: {
					_id: id,
				},
			},
		});
		const subcategoryData = category.subCategory.find((cat) => {
			return cat._id.toString() === id.toString();
		});
		res.status(200).json({
			baseResponse: {
				message: 'Sub catgeory data fetch successfully',
				status: 1,
			},
			response: subcategoryData,
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ baseResponse: { message: error.message, status: 0 } });
	}
};

const updateSubCategoryById = async (req, res) => {
	const { id } = req.params;
	const { subCategoryName, subCategoryDescription } = req.body;
	console.log(req.body, req.file, 'Sdf');
	try {
		if (req.file) {
			await categoryinstance.findOneAndUpdate(
				{
					'subCategory._id': id,
				},
				{
					$set: {
						'subCategory.$.subCategoryName': subCategoryName,
						'subCategory.$.subCategoryImage': req.file.filename,
						'subCategory.$.subCategoryDescription': subCategoryDescription,
					},
				},
			);
		} else {
			await categoryinstance.findOneAndUpdate(
				{
					'subCategory._id': id,
				},
				{
					$set: {
						'subCategory.$.subCategoryName': subCategoryName,
						'subCategory.$.subCategoryDescription': subCategoryDescription,
					},
				},
			);
		}
		res.status(200).json({
			baseResponse: { message: 'Sub catgeory update successfully', status: 1 },
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ baseResponse: { message: error.message, status: 0 } });
	}
};
const deleteSubCategoryById = async (req, res) => {
	const { id } = req.params;
	try {
		const result = await categoryinstance.findOneAndUpdate(
			{
				'subCategory._id': id,
			},
			{
				$pull: {
					subCategory: {
						_id: id,
					},
				},
			},
			{
				new: true,
			},
		);

		if (result) {
			res.status(200).json({
				baseResponse: {
					message: 'Subcategory deleted successfully',
					status: 1,
				},
			});
		} else {
			res.status(404).json({
				baseResponse: { message: 'Subcategory not found', status: 0 },
			});
		}
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ baseResponse: { message: error.message, status: 0 } });
	}
};

module.exports = {
	AddCategories,
	GetAllCategories,
	EditCategoryById,
	DeleteCategoryById,
	GetAllCatgoriesById,
	GetSingleCatgoryById,
	AddSubCategories,
	GetAllSubCategoriesById,
	AddSubSubCategories,
	GetAllSubCategories,
	getSubCategoryById,
	updateSubCategoryById,
	deleteSubCategoryById,
};
