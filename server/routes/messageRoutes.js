import express from 'express';
import {
  getConversations,
  getMessagesBetween,
  sendMessage,
  markAsRead,
  deleteMessage,
  getAllUsers,
} from '../controllers/messageController.js';

const router = express.Router();

/**
 * @route   GET /api/messages/conversations/:userId
 * @desc    Get all conversations for a user
 * @access  Public
 */
router.get('/conversations/:userId', getConversations);

/**
 * @route   GET /api/messages/:userId/:contactId
 * @desc    Get messages between two users
 * @access  Public
 */
router.get('/:userId/:contactId', getMessagesBetween);

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @body    { senderId, recipientId, content, requestId? }
 * @access  Public
 */
router.post('/', sendMessage);

/**
 * @route   PATCH /api/messages/read/:userId/:contactId
 * @desc    Mark messages as read
 * @access  Public
 */
router.patch('/read/:userId/:contactId', markAsRead);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @body    { userId }
 * @access  Public
 */
router.delete('/:messageId', deleteMessage);

/**
 * @route   GET /api/messages/users/:userId
 * @desc    Get all users (for composing new messages)
 * @access  Public
 */
router.get('/users/:userId', getAllUsers);

export default router;
