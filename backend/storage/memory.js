// Simple in-memory storage for development/testing
const users = new Map();
const sessions = new Map();

module.exports = {
  users,
  sessions
};
