// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios'); // Import Axios for HTTP requests
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new client instance with the necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // Enable presence tracking (to detect online/offline/idle)
  ],
});

// Function to check network connectivity by pinging a website
const checkNetworkConnection = async () => {
  try {
    const response = await axios.get('https://www.google.com');
    console.log('Network connection successful:', response.status);
    return true;  // Network connection is successful
  } catch (error) {
    console.error('Network connection failed:', error.message);
    return false;  // Network connection failed
  }
};

// Log when the bot starts
console.log('Bot is starting...');

// Function to login the bot with retry logic
async function loginBot() {
  try {
    await client.login(process.env.TOKEN);  // Try logging in
    console.log('Bot logged in successfully');
  } catch (err) {
    console.error('Login failed. Retrying...', err);
    setTimeout(loginBot, 5000);  // Retry after 5 seconds if login fails
  }
}

// Check network connection before attempting to log in
checkNetworkConnection().then(isConnected => {
  if (isConnected) {
    // Initialize the bot when the network connection is successful
    client.once('ready', () => {
      console.log(`Logged in as ${client.user.tag}`);
    });

    // Listen to presence updates (detect when a user changes status)
    client.on('presenceUpdate', (oldPresence, newPresence) => {
      console.log('Presence update detected');  // Debugging log

      // Define the tracked user IDs
      const trackedUserIds = ['856280684476629063', '637527706803896340', '707666763965399102'];  // Replace with actual user IDs

      // Check if the updated user's ID matches either of the two tracked user IDs
      if (trackedUserIds.includes(newPresence.user.id)) {
        // If there's no oldPresence or the status has changed
        if (!oldPresence || oldPresence.status !== newPresence.status) {
          const user = newPresence.user; // Get the user who changed their status
          const status = newPresence.status; // Get the new status (online, idle, offline, dnd)

          console.log(`${user.tag} is now ${status}`);

          // Send the status change message to a specific channel (replace YOUR_CHANNEL_ID)
          const channel = client.channels.cache.get('762025766497812511'); // Replace with actual channel ID
          if (channel) {
            channel.send(`${user.tag} is now ${status}`);
          }
        }
      }
    });

    // Attempt to login to Discord
    loginBot();
  } else {
    console.error('Unable to connect to the internet. Please check your network.');
  }
});
