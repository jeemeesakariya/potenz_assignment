const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    seedKey: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
