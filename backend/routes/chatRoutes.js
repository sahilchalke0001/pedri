const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Save or update a chat session
router.post("/", async (req, res) => {
  const { clerkUserId, message, messages } = req.body;

  if (!clerkUserId) {
    return res.status(400).json({ message: "Missing clerkUserId." });
  }

  let messagesToSave = [];

  if (Array.isArray(messages) && messages.length > 0) {
    messagesToSave = messages;
  } else if (message?.text && message?.role) {
    messagesToSave = [message];
  } else {
    return res.status(400).json({ message: "Missing or invalid message(s)." });
  }

  try {
    // Get the most recent chat session for this user
    const [chat] = await Chat.find({ clerkUserId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (chat) {
      chat.messages.push(...messagesToSave);
      await chat.save();
      return res.status(200).json({ message: "Chat updated", chat });
    } else {
      const newChat = new Chat({ clerkUserId, messages: messagesToSave });
      await newChat.save();
      return res
        .status(201)
        .json({ message: "New chat created", chat: newChat });
    }
  } catch (err) {
    console.error("Error saving chat:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
