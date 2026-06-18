import jwt from 'jsonwebtoken';
import Device from '../models/Device.js';
import CustomTopic from '../models/CustomTopic.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import firebaseApp from '../config/firebase.js';
import cloudinary from '../config/cloudinary.js';

// Helper to chunk array
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// @desc    Register a device token
// @route   POST /api/notifications/devices/register
// @access  Public/Optional Auth
export const registerDeviceToken = async (req, res) => {
  try {
    const { token, deviceType, platform, appVersion } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    let userId = null;
    let vendorId = null;
    let userType = null;

    // Parse authorization header manually to support unauthenticated/authenticated device registrations
    let authToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      authToken = req.headers.authorization.split(' ')[1];
    }

    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        if (decoded.role === 'vendor') {
          vendorId = decoded.id;
          userType = 'vendor';
        } else {
          userId = decoded.id;
          const user = await User.findById(decoded.id);
          if (user) {
            userType = 'user';
          } else {
            userType = 'user';
          }
        }
      } catch (err) {
        // Ignore token decode errors
      }
    }

    if (!userId && !vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to register device for push notifications'
      });
    }

    // Upsert the device registration
    const device = await Device.findOneAndUpdate(
      { token },
      {
        userId,
        vendorId,
        userType,
        deviceType: deviceType || 'web',
        platform: platform || 'web',
        appVersion: appVersion || '1.0.0',
        isActive: true,
        lastActiveAt: new Date()
      },
      { upsert: true, new: true }
    );

    // If there are active auto-subscribe topics, join them
    const autoTopics = await CustomTopic.find({ autoSubscribe: true, status: 'Active' });
    if (autoTopics.length > 0) {
      const topicKeys = autoTopics.map(t => t.topicKey);
      
      // Update local db
      await Device.updateOne(
        { _id: device._id },
        { $addToSet: { topics: { $each: topicKeys } } }
      );

      // Subscribe in Firebase if possible
      if (firebaseApp) {
        try {
          const messaging = firebaseApp.messaging();
          for (const topic of autoTopics) {
            await messaging.subscribeToTopic(token, topic.firebaseKeyGroup);
          }
        } catch (fcmErr) {
          console.error('Error auto-subscribing device to topics in FCM:', fcmErr.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Device token registered successfully',
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get device and audience stats for dashboard cards
// @route   GET /api/notifications/stats
// @access  Private/Admin
export const getNotificationStats = async (req, res) => {
  try {
    const totalDevices = await Device.countDocuments({ isActive: true });
    const customers = await Device.countDocuments({ userType: 'user', isActive: true });
    const partners = await Device.countDocuments({ userType: 'vendor', isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalDevices,
        customers,
        partners
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all registered devices (searchable and paginated)
// @route   GET /api/notifications/devices
// @access  Private/Admin
export const getDevices = async (req, res) => {
  try {
    const { search, userType, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { isActive: true };

    if (userType) {
      query.userType = userType;
    }

    let devices = await Device.find(query)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'name businessName phone email');

    // Filter by search terms if provided (since we have populated objects, we can filter in-memory if needed,
    // or run a more complex aggregate query. In-memory is fine for moderate size, or we do mongo matches)
    if (search) {
      const searchLower = search.toLowerCase();
      devices = devices.filter(d => {
        const userName = d.userId?.name?.toLowerCase() || '';
        const userEmail = d.userId?.email?.toLowerCase() || '';
        const userPhone = d.userId?.phone || '';
        const vendorName = d.vendorId?.name?.toLowerCase() || '';
        const businessName = d.vendorId?.businessName?.toLowerCase() || '';
        const vendorPhone = d.vendorId?.phone || '';
        const tokenVal = d.token.toLowerCase();

        return userName.includes(searchLower) ||
               userEmail.includes(searchLower) ||
               userPhone.includes(searchLower) ||
               vendorName.includes(searchLower) ||
               businessName.includes(searchLower) ||
               vendorPhone.includes(searchLower) ||
               tokenVal.includes(searchLower);
      });
    }

    const total = devices.length;
    const paginatedDevices = devices.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: paginatedDevices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all custom topics with subscriber counts
// @route   GET /api/notifications/topics
// @access  Private/Admin
export const getCustomTopics = async (req, res) => {
  try {
    const topics = await CustomTopic.find().sort({ createdAt: -1 });
    
    // Calculate subscribers count for each topic dynamically
    const topicsWithCount = await Promise.all(topics.map(async (topic) => {
      const count = await Device.countDocuments({
        topics: topic.topicKey,
        isActive: true
      });
      return {
        ...topic.toObject(),
        subscribersCount: count
      };
    }));

    res.status(200).json({
      success: true,
      data: topicsWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a custom audience topic
// @route   POST /api/notifications/topics
// @access  Private/Admin
export const createCustomTopic = async (req, res) => {
  try {
    const { topicKey, displayName, description, autoSubscribe } = req.body;

    if (!topicKey || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Topic key and display name are required'
      });
    }

    const existing = await CustomTopic.findOne({ topicKey: topicKey.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Topic key name already exists'
      });
    }

    const customTopic = await CustomTopic.create({
      topicKey,
      displayName,
      description,
      autoSubscribe: autoSubscribe || false
    });

    // If auto-subscribe is true, subscribe all existing active devices to this topic
    if (autoSubscribe) {
      const activeDevices = await Device.find({ isActive: true });
      if (activeDevices.length > 0) {
        const deviceIds = activeDevices.map(d => d._id);
        const tokens = activeDevices.map(d => d.token);

        await Device.updateMany(
          { _id: { $in: deviceIds } },
          { $addToSet: { topics: customTopic.topicKey } }
        );

        if (firebaseApp) {
          try {
            const messaging = firebaseApp.messaging();
            const tokenChunks = chunkArray(tokens, 1000); // FCM subscribe topic allows up to 1000 tokens per request
            for (const chunk of tokenChunks) {
              await messaging.subscribeToTopic(chunk, customTopic.firebaseKeyGroup);
            }
          } catch (fcmErr) {
            console.error('Error auto-subscribing existing devices in FCM:', fcmErr.message);
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Custom topic created successfully',
      data: customTopic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete custom topic and unsubscribe devices
// @route   DELETE /api/notifications/topics/:id
// @access  Private/Admin
export const deleteCustomTopic = async (req, res) => {
  try {
    const topic = await CustomTopic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Find all subscribed devices to unsubscribe in Firebase
    const subscribedDevices = await Device.find({ topics: topic.topicKey, isActive: true });
    if (subscribedDevices.length > 0 && firebaseApp) {
      try {
        const tokens = subscribedDevices.map(d => d.token);
        const messaging = firebaseApp.messaging();
        const tokenChunks = chunkArray(tokens, 1000);
        for (const chunk of tokenChunks) {
          await messaging.unsubscribeFromTopic(chunk, topic.firebaseKeyGroup);
        }
      } catch (fcmErr) {
        console.error('Error unsubscribing devices in FCM during topic deletion:', fcmErr.message);
      }
    }

    // Pull topicKey from all devices in local DB
    await Device.updateMany(
      { topics: topic.topicKey },
      { $pull: { topics: topic.topicKey } }
    );

    // Delete custom topic
    await topic.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Custom topic deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Subscribe list of devices/tokens to custom topic
// @route   POST /api/notifications/topics/subscribe
// @access  Private/Admin
export const subscribeDevices = async (req, res) => {
  try {
    const { topicKey, deviceIds, customTokens } = req.body;

    if (!topicKey) {
      return res.status(400).json({
        success: false,
        message: 'Topic key is required'
      });
    }

    const topic = await CustomTopic.findOne({ topicKey });
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Custom topic not found'
      });
    }

    let tokensToSubscribe = [];
    let dbDeviceIds = deviceIds || [];

    // Handle manual custom tokens input
    if (customTokens && customTokens.length > 0) {
      for (const token of customTokens) {
        const trimmedToken = token.trim();
        if (trimmedToken) {
          // Upsert as a customer device
          const dev = await Device.findOneAndUpdate(
            { token: trimmedToken },
            {
              userType: 'user',
              deviceType: 'web',
              platform: 'custom-pasted',
              isActive: true,
              lastActiveAt: new Date()
            },
            { upsert: true, new: true }
          );
          if (!dbDeviceIds.includes(dev._id.toString())) {
            dbDeviceIds.push(dev._id.toString());
          }
        }
      }
    }

    // Find devices to get tokens
    if (dbDeviceIds.length > 0) {
      const devices = await Device.find({ _id: { $in: dbDeviceIds } });
      tokensToSubscribe = devices.map(d => d.token);

      // Save locally in database
      await Device.updateMany(
        { _id: { $in: dbDeviceIds } },
        { $addToSet: { topics: topicKey } }
      );
    }

    // Subscribe via FCM
    let fcmResult = null;
    if (tokensToSubscribe.length > 0 && firebaseApp) {
      try {
        const messaging = firebaseApp.messaging();
        fcmResult = await messaging.subscribeToTopic(tokensToSubscribe, topic.firebaseKeyGroup);
        console.log(`Subscribed ${tokensToSubscribe.length} tokens to FCM topic ${topic.firebaseKeyGroup}`);
      } catch (fcmErr) {
        console.error('Error subscribing to FCM topic:', fcmErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Subscribed successfully to ${topic.displayName}`,
      data: {
        devicesUpdated: dbDeviceIds.length,
        tokensSubscribed: tokensToSubscribe.length,
        fcmResponse: fcmResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unsubscribe list of devices from custom topic
// @route   POST /api/notifications/topics/unsubscribe
// @access  Private/Admin
export const unsubscribeDevices = async (req, res) => {
  try {
    const { topicKey, deviceIds } = req.body;

    if (!topicKey || !deviceIds || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic key and device IDs are required'
      });
    }

    const topic = await CustomTopic.findOne({ topicKey });
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Custom topic not found'
      });
    }

    const devices = await Device.find({ _id: { $in: deviceIds } });
    const tokensToUnsubscribe = devices.map(d => d.token);

    // Update locally in DB
    await Device.updateMany(
      { _id: { $in: deviceIds } },
      { $pull: { topics: topicKey } }
    );

    // Unsubscribe in FCM
    let fcmResult = null;
    if (tokensToUnsubscribe.length > 0 && firebaseApp) {
      try {
        const messaging = firebaseApp.messaging();
        fcmResult = await messaging.unsubscribeFromTopic(tokensToUnsubscribe, topic.firebaseKeyGroup);
        console.log(`Unsubscribed ${tokensToUnsubscribe.length} tokens from FCM topic ${topic.firebaseKeyGroup}`);
      } catch (fcmErr) {
        console.error('Error unsubscribing from FCM topic:', fcmErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Unsubscribed successfully from ${topic.displayName}`,
      data: {
        devicesUpdated: deviceIds.length,
        tokensUnsubscribed: tokensToUnsubscribe.length,
        fcmResponse: fcmResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send broadcast or topic notification
// @route   POST /api/notifications/send
// @access  Private/Admin
export const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, body, targetCategory, imageUrl } = req.body;

    if (!title || !body || !targetCategory) {
      return res.status(400).json({
        success: false,
        message: 'Title, message body, and target category are required'
      });
    }

    let result = {
      success: true,
      mode: 'fcm',
      sentCount: 0
    };

    // Case 1: Send to a custom topic
    // If it starts with standard audience types, it's not custom, otherwise it represents the custom topicKey
    const standardCategories = ['all', 'customers', 'partners'];
    const isCustomTopic = !standardCategories.includes(targetCategory);

    if (isCustomTopic) {
      const topic = await CustomTopic.findOne({ topicKey: targetCategory });
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Target custom topic not found'
        });
      }

      const count = await Device.countDocuments({ topics: topic.topicKey, isActive: true });
      result.sentCount = count;

      if (firebaseApp) {
        try {
          const messaging = firebaseApp.messaging();
          const message = {
            notification: {
              title,
              body,
              ...(imageUrl ? { image: imageUrl } : {})
            },
            topic: topic.firebaseKeyGroup
          };
          const response = await messaging.send(message);
          result.fcmMessageId = response;
          console.log(`FCM broadcast to topic ${topic.firebaseKeyGroup} successful:`, response);
        } catch (fcmErr) {
          console.error('FCM broadcast send error:', fcmErr.message);
          return res.status(500).json({
            success: false,
            message: `FCM sending failed: ${fcmErr.message}`
          });
        }
      } else {
        result.mode = 'log';
        console.log(`[Notification Fallback Log - Topic ${topic.firebaseKeyGroup}] Title: "${title}" | Body: "${body}"`);
      }
    } else {
      // Case 2: Send to default audience categories by targeting matching device tokens
      let query = { isActive: true };
      if (targetCategory === 'customers') {
        query.userType = 'user';
      } else if (targetCategory === 'partners') {
        query.userType = 'vendor';
      }

      const devices = await Device.find(query);
      const tokens = devices.map(d => d.token);
      result.sentCount = tokens.length;

      if (tokens.length > 0) {
        if (firebaseApp) {
          try {
            const messaging = firebaseApp.messaging();
            const tokenChunks = chunkArray(tokens, 500); // 500 max multicast capacity in FCM
            const responses = [];

            for (const chunk of tokenChunks) {
              const res = await messaging.sendEachForMulticast({
                tokens: chunk,
                notification: {
                  title,
                  body,
                  ...(imageUrl ? { image: imageUrl } : {})
                }
              });
              responses.push(res);
            }
            result.fcmResponses = responses;
            console.log(`FCM multicast broadcast to ${tokens.length} devices successful`);
          } catch (fcmErr) {
            console.error('FCM multicast broadcast error:', fcmErr.message);
            return res.status(500).json({
              success: false,
              message: `FCM sending failed: ${fcmErr.message}`
            });
          }
        } else {
          result.mode = 'log';
          console.log(`[Notification Fallback Log - Multicast Category: ${targetCategory}] targeting ${tokens.length} devices | Title: "${title}" | Body: "${body}"`);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Notification dispatch initiated successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload notification image
// @route   POST /api/notifications/upload-image
// @access  Private/Admin
export const uploadNotificationImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const file = req.files.image;

    // Check file type
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size should be less than 5MB'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'notifications',
      resource_type: 'image'
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// --- automated triggers helper functions ---

// Helper function to send notification to user devices
export const sendToUser = async (userId, { title, body, data }) => {
  try {
    if (!userId) return;
    const devices = await Device.find({ userId, isActive: true });
    const tokens = devices.map(d => d.token);

    if (tokens.length === 0) {
      console.log(`No registered active devices for User ${userId}. Notification logged: "${title} - ${body}"`);
      return;
    }

    if (firebaseApp) {
      const messaging = firebaseApp.messaging();
      const tokenChunks = chunkArray(tokens, 500);
      for (const chunk of tokenChunks) {
        await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: { title, body },
          data: data || {}
        });
      }
      console.log(`FCM sent to User ${userId} successfully on ${tokens.length} devices`);
    } else {
      console.log(`[Notification Fallback Log - User ${userId}] Title: "${title}" | Body: "${body}"`);
    }
  } catch (error) {
    console.error(`Error sending push notification to User ${userId}:`, error.message);
  }
};

// Helper function to send notification to vendor devices
export const sendToVendor = async (vendorId, { title, body, data }) => {
  try {
    if (!vendorId) return;
    const devices = await Device.find({ vendorId, isActive: true });
    const tokens = devices.map(d => d.token);

    if (tokens.length === 0) {
      console.log(`No registered active devices for Vendor ${vendorId}. Notification logged: "${title} - ${body}"`);
      return;
    }

    if (firebaseApp) {
      const messaging = firebaseApp.messaging();
      const tokenChunks = chunkArray(tokens, 500);
      for (const chunk of tokenChunks) {
        await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: { title, body },
          data: data || {}
        });
      }
      console.log(`FCM sent to Vendor ${vendorId} successfully on ${tokens.length} devices`);
    } else {
      console.log(`[Notification Fallback Log - Vendor ${vendorId}] Title: "${title}" | Body: "${body}"`);
    }
  } catch (error) {
    console.error(`Error sending push notification to Vendor ${vendorId}:`, error.message);
  }
};
