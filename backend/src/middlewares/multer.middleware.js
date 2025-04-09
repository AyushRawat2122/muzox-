import multer from  "multer";
 
const storage = multer.memoryStorage();
 // shifting to memory buffer because diskStorage causing issue and max size is less than 10 mb so no worries.
const uploader = multer({
    storage: storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    },
  });

export default uploader;