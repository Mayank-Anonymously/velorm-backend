const { ObjectId } = require("mongodb");
const productinstance = require("../../model/products");
const testinomialinstance = require("../../model/testimonial");
const fs = require("fs");

const AddTestimonial = async (req, res) => {
  try {
    console.log(req.body, "wegwsdfgh")
    console.log(req.file, "efg");
    const {
      title,
      description
    } = req.body;

    const newTestimonial = new testinomialinstance({
      title,
      description,
      image: req.file.filename
    });
    console.log(newTestimonial, "AEg")
    if (title !== "" && description !== "") {
      await newTestimonial.save();
      res.status(200).json({
        message: "Created Successfuly",
        status: 1,
        response: newTestimonial,
      });
    } else {
      res.status(400).json({ message: "Bad Request", status: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: error, status: 0 });
  }
};

const GetAllTestimonialForAdmin = async (req, res) => {
  try {
    const FindAll = await testinomialinstance.find();
    if (FindAll.length !== null) {
      res.status(200).json({
        baseResponse: { message: "Testimonial Fetched", status: 1 },
        response: FindAll,
      });
    } else {
      res.status(400).json({
        baseResponse: { message: "No Testimonials Found", status: 0 },
        response: FindAll,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

const GetAllTestimonials = async (req, res) => {
  try {
    const FindAll = await testinomialinstance.find({ status: true });
    if (FindAll.length !== null) {
      res.status(200).json({
        baseResponse: { message: "Testimonials Fetched", status: 1 },
        response: FindAll,
      });
    } else {
      res.status(400).json({
        baseResponse: { message: "No Testimonials Found", status: 0 },
        response: FindAll,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};



const UpdateTestmonialById = async (req, res) => {
  console.log(req.file, "DFjh");
  console.log(req.body, "qewrtgwgh");

  const { _id } = req.params;
  const {
    description,
    title
  } = req.body;
  let ifExist = {};

  try {
    if (req.file) {
      ifExist = await testinomialinstance.findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $set: {
            title,
            description,
            image: req.file.filename
          },
        }
      );
    } else {
      ifExist = await testinomialinstance.findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $set: {
            title,
            description
          },
        }
      );
    }

    if (ifExist) {
      res.status(200).json({
        baseResponse: { message: "Updated Successfully", status: 1 },
        response: ifExist,
      });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res
      .status(500)
      .json({ baseResponse: { message: error.message, status: 0 } });
  }
};


const UpdateTestimonialStatusById = async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;

  try {
    const ifExist = await testinomialinstance.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          status: status,
        },
      }
    );

    if (ifExist) {
      res.status(200).json({
        baseResponse: { message: "Updated Successfully", status: 1 },
        response: ifExist,
      });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res
      .status(500)
      .json({ baseResponse: { message: error.message, status: 0 } });
  }
};

const deleteTestimonial = async (req, res) => {
  const { _id } = req.params;
  try {
    const ifExist = await testinomialinstance.deleteOne({ _id: _id });

    if (ifExist) {
      res
        .status(200)
        .json({ baseResponse: { message: "Deleted Successfuly", status: 1 } });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};


module.exports = {
  AddTestimonial,
  GetAllTestimonialForAdmin,
  GetAllTestimonials,
  UpdateTestmonialById,
  UpdateTestimonialStatusById,
  deleteTestimonial
};
