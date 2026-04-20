import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Message from './models/Message.js';
import HelpRequest from './models/HelpRequest.js';

dotenv.config();

const seedMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing messages
    await Message.deleteMany({});
    console.log('Cleared existing messages');

    // Find or create demo users with consistent IDs matching frontend
    let ayesha = await User.findOne({ name: 'Ayesha Khan' });
    let hassan = await User.findOne({ name: 'Hassan Ali' });
    let sara = await User.findOne({ name: 'Sara Noor' });

    if (!ayesha) {
      ayesha = await User.create({
        _id: 'demo-user-ayesha',
        name: 'Ayesha Khan',
        email: 'ayesha@demo.com',
        role: 'both',
        skills: ['Figma', 'Design Review', 'UI/UX'],
        trustScore: 92,
      });
    }

    if (!hassan) {
      hassan = await User.create({
        _id: 'demo-user-hassan',
        name: 'Hassan Ali',
        email: 'hassan@demo.com',
        role: 'can-help',
        skills: ['JavaScript', 'React', 'Node.js'],
        trustScore: 88,
      });
    }

    if (!sara) {
      sara = await User.create({
        _id: 'demo-user-sara',
        name: 'Sara Noor',
        email: 'sara@demo.com',
        role: 'need-help',
        skills: ['HTML/CSS', 'Portfolio'],
        trustScore: 75,
      });
    }

    console.log('Demo users ready:', {
      ayesha: ayesha._id,
      hassan: hassan._id,
      sara: sara._id,
    });

    // Create sample messages
    const now = new Date();
    const messages = [
      {
        sender: hassan._id,
        recipient: ayesha._id,
        content: 'Your event poster concept is solid. I would tighten the CTA and reduce the background texture.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: true,
      },
      {
        sender: ayesha._id,
        recipient: hassan._id,
        content: 'Thanks for the feedback! I will work on those changes.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 90), // 1.5 hours ago
        isRead: true,
      },
      {
        sender: ayesha._id,
        recipient: sara._id,
        content: 'I checked your portfolio request. Share the breakpoint screenshots and I can suggest fixes.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 45), // 45 minutes ago
        isRead: false,
      },
      {
        sender: sara._id,
        recipient: ayesha._id,
        content: 'Sure! Let me grab those screenshots for you.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
        isRead: true,
      },
      {
        sender: hassan._id,
        recipient: sara._id,
        content: 'I saw your request about responsive design. Happy to help review your CSS.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 15), // 15 minutes ago
        isRead: false,
      },
    ];

    await Message.insertMany(messages);
    console.log('Created', messages.length, 'sample messages');

    console.log('\n✅ Seeding complete!');
    console.log('\nDemo User IDs for testing:');
    console.log('- Ayesha Khan:', ayesha._id.toString());
    console.log('- Hassan Ali:', hassan._id.toString());
    console.log('- Sara Noor:', sara._id.toString());

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedMessages();
