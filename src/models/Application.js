const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    coverLetter: { type: String, trim: true, maxlength: 3000, default: '' },
    resumeSnapshot: {
      originalName: String,
      storedName: String,
      path: String,
      mimeType: String,
      size: Number,
      uploadedAt: Date,
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
