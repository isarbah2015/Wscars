/**
 * Barrel for Firebase service helpers.
 * Uses explicit named re-exports because Metro's web bundler does not always
 * preserve `export *` re-exports for modules whose side-effectful imports
 * resolve to `undefined` at evaluation time.
 */
export {
  loadOrCreateUserDoc,
  signInEmail,
  signUpEmail,
  signInWithGoogleIdToken,
  signInWithGooglePopup,
  signOut,
  sendPasswordResetEmail,
  subscribeAuth,
  authErrorMessage,
} from "./auth";

export {
  subscribeCars,
  createCar,
  updateCar,
  deleteCar,
  markCarSold,
  setCarHidden,
  renewCar,
} from "./cars";

export {
  getUser,
  listUsers,
  subscribeUsers,
  updateUser,
} from "./users";

export {
  subscribeConversations,
  subscribeMessages,
  getOrCreateConversation,
  sendMessage,
  markConversationRead,
  softDeleteMessage,
} from "./messages";

export {
  subscribeReviews,
  createReview,
} from "./reviews";

export {
  subscribeReports,
  createReport,
  setReportStatus,
} from "./reports";

export {
  uploadCarImage,
  uploadIdImage,
  uploadAvatar,
  uploadChatMedia,
} from "./storage";
