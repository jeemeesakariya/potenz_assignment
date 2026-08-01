const fs = require('fs/promises');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

async function upload(user, file) {
  if (!file) throw new AppError(400, 'A resume file is required in the resume field');
  const oldPath = user.resume?.path;
  user.resume = {
    originalName: file.originalname,
    storedName: file.filename,
    path: file.path,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
  await userRepository.save(user);
  if (oldPath && oldPath !== file.path) await fs.unlink(oldPath).catch(() => {});
  return user.resume;
}

async function removeUploadedFile(file) {
  if (file?.path) await fs.unlink(file.path).catch(() => {});
}

module.exports = { upload, removeUploadedFile };
