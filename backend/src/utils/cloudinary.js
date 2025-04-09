import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
//configuration of cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:true,
});

const uploadOnCloudinary = async (fileBuffer) => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) return null;

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
    return result;
  } catch {
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
