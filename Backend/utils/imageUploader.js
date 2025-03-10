const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  // console.log("aman");
  const options = { folder };
  options.resource_type = "auto";

  if (quality) {
    options.quality = quality;
  }
  if (height) {
    options.height = height;
  }
  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
