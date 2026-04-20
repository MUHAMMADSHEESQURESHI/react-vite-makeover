import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * Get all conversations for a user (grouped by contact)
 */
export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate('request', 'title')
      .sort({ createdAt: -1 });

    // Group by contact (the other person in the conversation)
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const contactId = msg.sender._id.toString() === userId
        ? msg.recipient._id.toString()
        : msg.sender._id.toString();

      const contact = msg.sender._id.toString() === userId
        ? msg.recipient
        : msg.sender;

      if (!conversationMap.has(contactId)) {
        conversationMap.set(contactId, {
          contact: {
            id: contact._id,
            name: contact.name,
            email: contact.email,
            avatar: contact.avatar,
          },
          lastMessage: {
            id: msg._id,
            content: msg.content,
            createdAt: msg.createdAt,
            isFromMe: msg.sender._id.toString() === userId,
            isRead: msg.isRead,
          },
          unreadCount: 0,
        });
      }

      // Count unread messages (from other person, not read, and not from me)
      if (!msg.isRead && msg.sender._id.toString() !== userId) {
        conversationMap.get(contactId).unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversations',
      error: error.message,
    });
  }
};

/**
 * Get messages between two users
 */
export const getMessagesBetween = async (req, res) => {
  try {
    const { userId, contactId } = req.params;

    if (!userId || !contactId) {
      return res.status(400).json({
        success: false,
        message: 'userId and contactId are required',
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: contactId },
        { sender: contactId, recipient: userId },
      ],
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate('request', 'title')
      .sort({ createdAt: 1 });

    // Mark messages as read if they're from the other person and not read
    await Message.updateMany(
      {
        sender: contactId,
        recipient: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages',
      error: error.message,
    });
  }
};

/**
 * Send a new message
 */
export const sendMessage = async (req, res) => {
  try {
    const { senderId, recipientId, content, requestId } = req.body;

    if (!senderId || !recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'senderId, recipientId, and content are required',
      });
    }

    // Verify users exist
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({
        success: false,
        message: 'Sender or recipient not found',
      });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
      request: requestId || null,
      isRead: false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate('request', 'title');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message',
      error: error.message,
    });
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { userId, contactId } = req.params;

    const result = await Message.updateMany(
      {
        sender: contactId,
        recipient: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read',
      error: error.message,
    });
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    if (!messageId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'messageId and userId are required',
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only allow sender to delete their own message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message',
      error: error.message,
    });
  }
};

/**
 * Get all users (for composing new messages)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    const users = await User.find({ _id: { $ne: userId } }).select('name email avatar skills');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message,
    });
  }
};
