const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// create course handler function
exports.createCourse = async (req, res) => {

    try{
        // fetch data
        // tag ki id fetch hui h kyuki model me vo ref type se pass hui h isliye
        // validation me bhi findById se hi validate krna padega
        // Get user ID from request object
		const userId = req.user.id;
		let {
			courseName,
			courseDescription,
			whatYouWillLearn,
			price,
			tag,
			category,
			status,
			instructions,
		} = req.body;


        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        // Check if any of the required fields are missing
		if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category) {
			return res.status(400).json({
				success: false,
				message: "All Fields are Mandatory",
			});
		}

		if (!status || status === undefined) {
			status = "Draft";
		}

		// Check if the user is an instructor
		const instructorDetails = await User.findById(userId, { accountType: "Instructor",}	);
        // console.log("Instructor details: ",instructorDetails);
        // todo:- verify instructor or user id same ?

		if (!instructorDetails) {
			return res.status(404).json({
				success: false,
				message: "Instructor Details Not Found",
			});
		}

		// Check if the tag given is valid
		const categoryDetails = await Category.findById(category);
		if (!categoryDetails) {
			return res.status(404).json({ 
				success: false,
				message: "category Details Not Found",
			});
		}

		// Upload the Thumbnail to Cloudinary
		const thumbnailImage = await uploadImageToCloudinary(
            // pass file name and kis folder me store krni h
			thumbnail,
			process.env.FOLDER_NAME
		);
		console.log(thumbnailImage);

		// Create an entry for new course with given details
		const newCourse = await Course.create({
			courseName,
			courseDescription, 
            // is step k liye hi userId nikali thi
			instructor: instructorDetails._id,
			whatYouWillLearn: whatYouWillLearn,
			price,
			tag: tag,
			category: categoryDetails._id,
            // thumbnail me jo bhi secured url aayega vo store krege
			thumbnail: thumbnailImage.secure_url,
			status: status,
			instructions: instructions,
		});

        // add the new course to the user schema of the Instructor :- use Push operator
        await User.findByIdAndUpdate(
			{
				_id: instructorDetails._id,
			},
			{
				$push: {
					courses: newCourse._id,
				},
			},
			{ new: true }
		);

		// Add the new course to the Categories
		await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);

		// Return the new course and a success message
		res.status(200).json({
			success: true,
			data: newCourse,
			message: "Course Created Successfully",
		});


	}
    catch (error) {
		// Handle any errors that occur during the creation of the course
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to create course",
			error: error.message,
		});
	}
}; 

    
   
 
// get all courses handler function
exports.getAllCourses = async (req, res) => {
	try {
		const allCourses = await Course.find(
			{},
			{
				courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentsEnrolled: true,
			}
		)
		.populate("instructor")
		.exec();

		return res.status(200).json({
			success: true,
            message: 'Data for all courses fetched successfully',
			data: allCourses,
		});

	}
    
    catch (error) {
		console.log(error);
		return res.status(404).json({
			success: false,
			message: `Can't Fetch Course Data`,
			error: error.message,
		});
	}
};

//getCourseDetails
exports.getCourseDetails = async (req, res) => {
    try {
            //get id
            const {courseId} = req.body;
            //find course details
            const courseDetails = await Course.find(
                                        {_id:courseId})
                                        .populate(
                                            {
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        //.populate("ratingAndreviews")
                                        .populate({
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection",
                                            },
                                        })
                                        .exec();

                //validation
                if(!courseDetails) {
                    return res.status(400).json({
                        success:false,
                        message:`Could not find the course with ${courseId}`,
                    });
                }
                //return response
                return res.status(200).json({
                    success:true,
                    message:"Course Details fetched successfully",
                    data:courseDetails,
                })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}