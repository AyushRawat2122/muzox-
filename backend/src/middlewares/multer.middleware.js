import multer from  "multer";
 
const storage = multer.memoryStorage();
 // shifting to memory buffer because diskStorage causing issue and max size is less than 10 mb so no worries.
const uploader = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

export default uploader;