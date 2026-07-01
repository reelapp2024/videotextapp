var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var jobCancellation_exports = {};
__export(jobCancellation_exports, {
  JobCancelledError: () => JobCancelledError,
  clearJobCancelled: () => clearJobCancelled,
  isJobCancelled: () => isJobCancelled,
  isJobCancelledAsync: () => isJobCancelledAsync,
  markJobCancelled: () => markJobCancelled
});
module.exports = __toCommonJS(jobCancellation_exports);
const cancelledJobIds = /* @__PURE__ */ new Set();
function markJobCancelled(jobId) {
  cancelledJobIds.add(jobId);
}
function isJobCancelled(jobId) {
  return cancelledJobIds.has(jobId);
}

async function isJobCancelledAsync(jobId) {
  if (isJobCancelled(jobId)) return true;
  try {
    const VideoJob = require("../models/VideoJob");
    const job = await VideoJob.findOne({ jobId }).select("status").lean();
    return job?.status === "cancelled";
  } catch {
    return false;
  }
}
function clearJobCancelled(jobId) {
  cancelledJobIds.delete(jobId);
}
class JobCancelledError extends Error {
  constructor() {
    super("Job cancelled by user");
    this.name = "JobCancelledError";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JobCancelledError,
  clearJobCancelled,
  isJobCancelled,
  isJobCancelledAsync,
  markJobCancelled
});
