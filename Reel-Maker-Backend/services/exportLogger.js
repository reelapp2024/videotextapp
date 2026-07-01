const { getWorkerId } = require('./workerContext');

/**
 * Structured JSON logging for production export monitoring (M9).
 * @param {string} event
 * @param {object} fields
 */
function exportLog(event, fields = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    workerId: getWorkerId(),
    ...fields,
  };
  console.log(JSON.stringify(entry));
}

module.exports = { exportLog };
