// Preload script for Electron
// This script runs in the context of the renderer process but has access to Node.js APIs

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Send a message to the main process
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ['model-request', 'api-key-update', 'settings-update'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive a message from the main process
    receive: (channel, func) => {
      let validChannels = ['model-response', 'api-key-response', 'settings-response', 'error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
