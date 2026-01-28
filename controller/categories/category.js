const categoryinstance = require('../../model/categories');

/**
 * ADD CATEGORY
 */
const AddCategories = async (req, res) => {
	try {
		const { categoryName, categoryDescription, status, type } = req.body;

		if (!categoryName || !status) {
			return res
				.status(400)
				.json({ message: 'Bad Request', status: 0 });
		}

		const ifAlreadyExist = await categoryinstance.findOne({ categoryName });

		if (ifAlreadyExist) {
			return res.status(422).json({
				message: 'Category With This Name Already Exists',
				status: 0,
			});
		}

		const newCategory = new categoryinstance({
			categoryName,
			categoryDescription,
			categoryImage: req.file?.filename,
			status: JSON.parse(status),
			type,
		});

		await newCategory.save();

		res.status(200).json({
			message: 'Created Successfully',
			status: 1,
		});
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

/**
 * GET ALL CATEGORIES
 */
const GetAllCategories = async (req, res) => {
	try {
		const categories = await categoryinstance.find({});

		if (categories.length > 0) {
			res.status(200).json({
				baseResponse: { message: 'Categories Fetched', status: 1 },
				response: categories,
			});
		} else {
			res.status(200).json({
				baseResponse: { message: 'No Categories Found', status: 0 },
				response: [],
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

/**
 * GET CATEGORY BY ID
 */
const GetSingleCategoryById = async (req, res) => {
	const { _id } = req.params;

	try {
		const category = await categoryinstance.findById(_id);

		if (category) {
			res.status(200).json({
				baseResponse: { message: 'Category Fetched', status: 1 },
				response: category,
			});
		} else {
			res.status(404).json({
				baseResponse: { message: 'Category Not Found', status: 0 },
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

/**
 * EDIT CATEGORY
 */
const EditCategoryById = async (req, res) => {
	const { _id } = req.params;

	try {
		const { categoryName, categoryDescription, status } = req.body;

		const updatedCategory = await categoryinstance.findByIdAndUpdate(
			_id,
			{
				categoryName,
				categoryDescription,
				categoryImage: req.file?.filename,
				status,
			},
			{ new: true },
		);

		if (updatedCategory) {
			res.status(200).json({
				baseResponse: { message: 'Updated Successfully', status: 1 },
			});
		} else {
			res.status(404).json({
				baseResponse: { message: 'Category Not Found', status: 0 },
			});
		}
	} catch (error) {
		res.status(500).json({
			baseResponse: { message: error.message, status: 0 },
		});
	}
};

/**
 * DELETE CATEGORY
 */
const DeleteCategoryById = async (req, res) => {
	const { _id } = req.params;

	try {
		const deleted = await categoryinstance.findByIdAndDelete(_id);

		if (deleted) {
			res.status(200).json({
				baseResponse: { message: 'Deleted Successfully', status: 1 },
			});
		} else {
			res.status(404).json({
				baseResponse: { message: 'Category Not Found', status: 0 },
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message, status: 0 });
	}
};

module.exports = {
	AddCategories,
	GetAllCategories,
	GetSingleCategoryById,
	EditCategoryById,
	DeleteCategoryById,
};
