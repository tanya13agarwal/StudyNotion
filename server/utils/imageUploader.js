const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async( file, folder, height, quality ) => {
    const options = {folder};
    // agr height available h then include in options
    if(height){
        options.height = height;
    }
    if(quality){
        options.quality = quality;
    }
    // apne aap determine krlo kis type ka resource h
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}