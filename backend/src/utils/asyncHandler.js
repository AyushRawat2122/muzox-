/**
@param {Function} requestHandler - The async route handler. @returns {Function} Express middleware function.
 */
const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default asyncHandler;
