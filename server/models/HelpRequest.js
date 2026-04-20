import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['technical', 'academic', 'health', 'financial', 'emotional', 'other'],
      default: 'other',
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
     status: {
       type: String,
       enum: ['open', 'solved'],
       default: 'open',
     },
     aiSummary: {
       type: String,
       default: '',
     },
     createdBy: {
      type: String,
      required: [true, 'createdBy (userId) is required'],
    },
    assignedTo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

helpRequestSchema.index({ category: 1, urgency: 1, status: 1 });

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);

export default HelpRequest;
