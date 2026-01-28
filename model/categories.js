const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');



const category = new mongoose.Schema(
	{
		categoryName: String,
		categoryImage: String,
		categoryDescription: String,
		status: Boolean,
	
		type: String,
	},
	{ timestamps: true },
);

autoIncrement.initialize(mongoose.connection);
const categoryinstance = new mongoose.model('category', category);
module.exports = categoryinstance;
