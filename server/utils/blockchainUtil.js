const crypto = require('crypto');

const createBlockHash = (previousHash, fileHash, timestamp) => {
  const data = previousHash + fileHash + timestamp;
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  createBlockHash
};