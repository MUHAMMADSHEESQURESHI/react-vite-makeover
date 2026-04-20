import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HelpRequest',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient conversation queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
