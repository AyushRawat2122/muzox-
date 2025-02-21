import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

const uploadRouter = {
  profilePicUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    console.log("Profile Picture Uploaded:", data);
  }),

  coverPicUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    console.log("Cover Picture Uploaded:", data);
  }),
};

export default uploadRouter;
