import { v2 as cloudinary } from "cloudinary";
import { unlinkSync } from "fs";
//configuration of cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (uploadedFilePath) => {
  try {
    if (!uploadedFilePath) {
      return null; // if no local path given we ll return null and handle this where called
    }
    //uploading file on the cloud service
    const uploadedFile = await cloudinary.uploader.upload(uploadedFilePath, {
      resource_type: "auto",
    });

    unlinkSync(uploadedFilePath); //synchronously unlinking that file
    return uploadedFile;
  } catch (error) {
    unlinkSync(uploadedFilePath); //synchronously unlinking that file , even If file was not uploaded hence removing before error comes
    return null;
  }
};

const deleteOnCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return null; // if no public id given we ll return null and handle this where called
    }
    const deletedFile = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
    return deletedFile; // return the result success or failure
  } catch (error) {
    return null; // handle nullError{falsy value} where the function is called
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
