const AppError = require('../utils/AppError');

module.exports = (req, _res, next) => {
  if (!req.file) {
    return next(new AppError(400, 'Please attach a resume', [
      { field: 'resume', message: 'resume is required and must be a PDF, DOC, or DOCX file' },
    ]));
  }
  next();
};
