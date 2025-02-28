const Category = require("../models/Category");

//creating Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //create entry in DB
    const CategoryDetails = Category.create({
      name: name,
      description: description,
    });

    res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "error while creating Category ,please try again",
    });
  }
};

//get all Categories

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "All Categories fectched successfully",
      allCategories,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "error while fetching all allCategories ,please try again",
    });
  }
};

//category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    // console.log("PRINTING CATEGORY ID: ", categoryId);
    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();

    // Handle the case when the category is not found
    if (!selectedCategory) {
      // console.log("Category not found.");
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      // console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
      course: { $not: { $size: 0 } },
    });

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();

    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
