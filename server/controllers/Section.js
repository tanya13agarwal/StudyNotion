const Section = require("../models/Section");
const Course = require("../models/Course");

// create a new section
exports.createSection = async( req,res ) => {
    try
    {
        // data fetch
        const { sectionName,courseId } = req.body;

        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: 'Missing properties',
            });
        }

        // create section with the given name
        const newSection = await Section.create({sectionName});

        // update course with section object ID
        // Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {courseContent: newSection._id},
			},
			{ new: true }
		)
            // populate is used when we need the exact object
            // section or subsection dono ko ek sath populate krwado
            .populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	}
    catch (error) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};


// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
        // data fetch
		const { sectionName, sectionId } = req.body;

        // data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message: 'Missing properties',
            });
        }

        // update section
		const section = await Section.findByIdAndUpdate(
            // sectionId k through access kia, and sectionName ko update krna h 
			sectionId,
			{ sectionName },
			{ new: true }
		);

        // return response
		res.status(200).json({
			success: true,
			message: 'Section updated succesfully',
		});
	}
    catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};


// DELETE a section
exports.deleteSection = async (req, res) => {

	try {
		// assuming we are sending id in parameters 
		const { sectionId } = req.params;

		await Section.findByIdAndDelete(sectionId);
        // todo:- testing k time dekhege:- course se bhi to us section id ko hatana padega ? -> update course
		res.status(200).json({
			success: true,
			message: "Section deleted",
		});
	}
    catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};