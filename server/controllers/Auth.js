const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// send OTP
exports.sendotp = async(req,res) => {

    try{
        // fetch email from req.body
        const {email} = req.body;
        // check if user already exist
        const checkUserPresent = await User.findOne({email});

        // if user already exist, return response
        if(checkUserPresent){
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: "User already registered",
            });
        } 

        // else generate OTP 
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("OTP generated :- ",otp);

        // check if the OPT generated is unique
        // if not unique then generate again until you get unique OTP
        const result = await OTP.findOne({ otp: otp });
		console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
        }

        // otp ki db entry me krne k liye obj create krege otp ka
        const otpPayload = { email, otp };
        // create an entry in db
        const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);

        // return response sucessfully
        res.status(200).json({
            sucess: true,
            message: 'Otp sent successfully', 
            otp,
        })
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }

};


// Signup Controller for Registering Users
exports.signup = async( req, res ) => {
    
    try{
        // fetch data from req.body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        // validate krlo
        // accountType or contact no. isliye add ni kia kyuki 
        // account type to switch tab hai to aap agr ni value doge tb bhi kuch na uch to hoga hi
        // contactNumber is optional field, agr compulsory hogi to yha mention krna padega
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success: false, 
                message: "ALl fields are required",
            })
        }

        // match both password and confirmPassword
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: 'Password and ConfirmPassword values do not match, Please try again.',
            });
        }

        // check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: 'User is already registered.',
            });
        }

        // find most recent OTP stored for the user
        // there are chances multiple same otp entries may exit in db therefore
        // sort them according to the time they entered the system and pick the most recent one
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		console.log(response);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create entry in db

        // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        // jse hi koi signup krega, profile details null se initialize hogi so that the user can fill all his personal details
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            approved: approved,
            // profile details ko id k form me access kr lia
            additionalDetails: profileDetails._id,
            // access from dicebear (a third party service)
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return response
        return res.status(200).json({
            success: true,
            message: 'User is registered successfully',
            user, 
        });
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered, please try again.',
        })
    }
}; 


// login controller for authenticating users
exports.login = async( req, res ) => {
    try{

        // fetch data from req.body
        const {email, password} = req.body;
        // data validation
        if(!email || !password){
            return res.status(400).json({
                success: false, 
                message: "ALl fields are required, please try again",
            });
        }
        // check user exist or not
        // populate is fetching and integrating related data from other collections into a single query result.
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: 'User is not registered, please signup first.',
            });
        }

        // generate JWT after password matching and compare password
        if(await bcrypt.compare(password, user.password)){
            // const payload = {
            //     email: user.email,
            //     id: user._id,
            //     accountType: user.accountType,
            // }
            // another way:-
            const token = jwt.sign({ email: user.email, id: user._id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);
            // Save token to user document in database
            user.token = token; 
            user.password = undefined;

            // create cookie and send response
            const options = {
                // expires after 3 days
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            };
            res.cookie("token", token,options).status(200).json({
                success: true,
                token,
                user,
                message: `logged in succesfully`
            })
            
        }
        else{
            return res.status(401).json({
                success: false, 
                message: `Password is incorrect`,
            });
        }
        
    }
    catch(error){ 
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure, please try again',
        });
    }
};




// change password
exports.changePassword = async( req, res ) => {
    try{
        // get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // fetch oldPassword, newPassword, confirmNewPassword
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        // Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password,
		);
		if (!isPasswordMatch) {
			// If old password does not match
			return res.status(401).json({
                success: false, message: "The password is incorrect"
            });
		}

        // match newPassword, confirmNewPassword
        if (newPassword !== confirmNewPassword) {
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

        // update password in database
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

        // send notification mail
        try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		}
        catch (error) {
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res.status(200).json({
            success: true, message: "Password updated successfully"
        });
	}

    catch (error) {
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
            // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}

};