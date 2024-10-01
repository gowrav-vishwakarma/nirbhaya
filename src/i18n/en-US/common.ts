// This is just an example,
// so you can safely delete all default props below

export default {
  // App-wide
  appname: 'Shoutout',
  login: 'Login',
  logout: 'Logout',
  cancel: 'Cancel',
  save: 'Save',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  done: 'Done',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Information',

  language: 'Language',
  languages: {
    'en-US': 'English',
    'hi-IN': 'Hindi',
    'gu-IN': 'Gujarati',
  },

  icons: {
    phone: 'phone',
    lock: 'lock',
    help: 'help',
    delete: 'delete',
    addCircle: 'add_circle',
    myLocation: 'my_location',
    locationOn: 'location_on',
    mic: 'mic',
    volumeUp: 'volume_up',
    hospital: 'local_hospital',
    build: 'build',
    contacts: 'contacts',
    speaker: 'volume_up',
    videocam: 'videocam',
  },
  sosEventsMap: 'SOS Events Map',
  eventType: 'Event Type',
  eventStatus: {
    all: 'All',
    created: 'Created',
    active: 'Active',
    cancelled: 'Cancelled',
    resolved: 'Resolved',
  },
  createdAt: 'Created At',

  // Navigation
  dashboard: 'Dashboard',
  account: 'Account',
  help: 'Help',

  // Login Page
  mobileNumber: 'Mobile Number',
  enterOTP: 'Enter OTP',
  sendOTP: 'Send OTP',
  loginFailed: 'Login failed. Please check your OTP and try again.',
  otpSendFailed: 'Failed to send OTP. Please try again.',
  aboutUs: 'About Us',

  // Dashboard Page
  welcome: 'What Happened {name}?',
  sosButton: 'SOS',
  sosButtonSubtitle: 'Send emergency alert to nearby volunteers',
  missingPermissions: 'Some permissions are missing',
  request: 'Request {permission}',
  helpFor: 'Help for {permission}',
  dashboardSubtitle: 'Stay safe and connected with your community',
  helpContacts: 'Help From Contacts',
  helpContactsSubtitle: 'Notify only your emergency contacts',
  quickActions: 'Quick Actions',
  updateProfile: 'Update Profile',
  viewNotifications: 'View Notifications',
  getHelp: 'Get Help',
  notificationsPermissionHelp: 'notifications Permission Help',
  errorGettingLocation: 'Error getting location. Please try again.',
  locationPermissionDenied:
    'Location permission denied. Please enable location access in your settings.',
  errorFetchingVolunteers:
    'Error fetching nearby volunteers. Please try again.',
  locationPermissionRequired:
    'Location permission is required to find nearby volunteers.',
  retry: 'Retry',

  // Profile Page
  name: 'Name',
  city: 'City',
  userType: 'User Type',
  emergencyContacts: 'Emergency Contacts',
  emergencyContactsHelp:
    'Add up to 3 emergency contacts who will be notified in case of an emergency.',
  addEmergencyContact: 'Add New',
  contactName: 'Contact Name',
  contactNumber: 'Contact Number',
  removeContact: 'Remove Contact',
  atLeastOneEmergencyContactRequired:
    'At least one emergency contact is required.',
  saveChanges: 'Save Changes',
  profileUpdateSuccess: 'Profile updated successfully',
  profileUpdateError: 'Failed to update profile',
  pleaseSelectLocation: 'Please select location',
  contactNumberRequired: 'Contact number is required',
  contactNameRequired: 'Contact name is required',
  profession: 'Profession',
  hospital: 'Hospital',
  doctorGeneral: 'Doctor General',
  doctorEmergency: 'Doctor Emergency',
  mechanic2Wheeler: '2 Wheeler Mechanic',
  mechanic4Wheeler: '4 Wheeler Mechanic',
  mechanicBoth: '2&4 Wheeler Mechanic',
  nurse: 'Nurse',
  other: 'Other',
  sosSettings: 'SOS Settings',
  startAudioVideoRecordOnSos: 'Start Audio/Video Record on SOS (local)',
  streamAudioVideoOnSos: 'Stream Audio/Video on SOS (on server)',
  broadcastAudioOnSos: 'Broadcast Audio on SOS (to volunteers)',
  emergencyContactRequests: 'Requests',
  noEmergencyContacts: "You are not in anyone's emergency contact list",
  approve: 'Approve',
  reject: 'Reject',
  remove: 'Remove',

  // Permissions
  appPermissions: 'App Permissions',
  location: 'Location',
  camera: 'Camera',
  microphone: 'Microphone',
  notifications: 'Notifications',
  granted: 'Granted',
  requestPermission: 'Request Permission',
  permissionGranted: '{permission} permission granted',
  permissionDenied: '{permission} permission denied',

  // SOS Mode
  sosWarning: 'SOS Mode Activated',
  cancelSOS: 'Cancel SOS',
  sosSent: 'SOS Sent',
  sosNotified: 'Notified {count} nearby persons',
  sosAccepted: 'Accepted by {count} persons',
  emergencyContactsInformed: 'Emergency contacts informed',
  helpUsMore: 'Help us understand the situation better',
  currentLocation: 'Current Location',
  gettingLocation: 'Getting your location...',
  coordinates: 'Coordinates',
  nearbyPoliceStations: 'Nearby Police Stations',
  contactPoliceStation: 'Contact Police Station',
  resolveSOSIssue: 'Resolve SOS Issue',
  audioOpen: 'Audio Open',
  clickToOpenAudio: 'Click to Open Audio',
  sosMode: 'SOS Mode',
  sosCountdownMessage: '',
  notifiedPersons: 'Notified to persons',
  acceptedPersons: 'Accepted by persons',
  yes: 'yes',
  audioConnected: 'audio Connected',
  speakerOn: 'Speaker On',
  speakerOff: 'Speaker Off',

  // Threat Types
  followedBySomeone: 'Followed by Someone',
  verbalHarassment: 'Verbal Harassment',
  physicalThreat: 'Physical Threat',
  attemptedKidnapping: 'Attempted Kidnapping',
  sexualAssault: 'Sexual Assault',
  domesticViolence: 'Domestic Violence',
  unknown: 'Unknown',

  // Help Page
  locationPermission: 'Location Permission',
  locationPermissionHelp:
    'Allowing location access helps us to send help to your exact location in case of an emergency. Remember, your location is never saved unless you send SOS. Even when you are ready to help community, your location is not saved.',
  cameraPermission: 'Camera Permission',
  cameraPermissionHelp:
    'Camera access allows you to capture and send visual evidence during an emergency.',
  microphonePermission: 'Microphone Permission',
  microphonePermissionHelp:
    'Microphone access enables audio recording during emergencies for better assistance.',
  notificationPermission: 'Notification Permission',
  notificationPermissionHelp:
    'Notifications keep you informed about important alerts and updates.',
  appHelp: 'app Help',
  permissionsHelp: 'permissions Help',
  gettingStarted: 'getting Started',
  gettingStartedContent: 'getting Started Content',
  watchVideo: 'watch Video',
  usingSOS: 'using SOS',
  usingSOSContent: 'using SOS Content',
  volunteeringHelp: 'volunteering Help',
  volunteeringHelpContent: 'volunteering Help Content',
  helpVideo: 'Help Video',
  howToEnable: 'how to enable',
  pwaLocationHelp: 'PWA Location Help',
  platformSpecificHelp: 'platform Specific Help',
  pwaCameraHelp: 'PWA Camera Help',

  // Errors and Validations
  nameRequired: 'Name is required',
  invalidMobileNumber: 'Please enter a valid 10-digit mobile number',
  invalidOTP: 'Please enter a valid 4-digit OTP',
  phoneNumberNotInSystem: 'This phone number is not registered in our system',
  phoneValidationError: 'Error validating phone number',
  pleaseFixErrors: 'Please fix the errors before submitting',

  // Volunteering
  notificationLocations: 'Notification Locations',
  notificationLocationsHelp:
    "Add locations where you'd like to receive SOS notifications",
  locationName: 'Location Name',
  useCurrentLocation: 'Use Current Location',
  addNotificationLocation: 'Add Notification Location',
  availableForCommunity: 'Available for Community Assistance',
  availableForCommunityDescription:
    'Toggle this to indicate your availability to help others in emergencies',
  volunteeringUpdateSuccess: 'Volunteering information updated successfully',
  volunteeringUpdateError: 'Failed to update volunteering information',
  pleaseSelectAllLocations: 'Please select all locations before saving',
  availableForPaidProfessionalService:
    'Available for Paid Professional Service',
  availableForPaidProfessionalServiceDescription:
    'Toggle this to indicate your availability to provide paid professional services in case of an emergency',
  searchRadius: 'Search Radius',
  volunteersFound: 'Volunteers available within',
  distance: 'distance',
  volunteeringSettings: 'Volunteering Preferences',
  availabilitySettings: 'Availability Preferences',

  // Misc
  noLocationSet: 'No location set',
  locationUpdated: 'Location updated',
  locationError: 'Error getting location',
  locationWatchError: 'Error watching location',

  // Account Page
  profile: 'Profile',
  volunteering: 'Volunteering',
  logoutSuccess: 'Logged out successfully',
  logoutError: 'Error logging out',
  profileSettings: 'My Profile',
  pendingApproval: 'Pending Approval',
  approved: 'Approved',
  close: 'Close',
  errorFetchingContacts: 'Server Error',

  // Notifications Page
  noNotificationsFound: 'No notifications found.',
  status: 'Status',
  threat: 'Threat',
  accept: 'Accept',
  discard: 'Discard',
  follow: 'Follow',
  notificationAcceptedSuccess: 'Notification accepted successfully',
  notificationAcceptedError: 'Failed to accept notification',
  muteAudio: 'Mute Audio',
  unmuteAudio: 'Unmute Audio',

  notificationTitles: {
    volunteerNearby: 'Nearby {eventType} alert',
    emergencyContact: 'Emergency contact "{victimName}" alert: {eventType}',
    contactsOnly: 'Help needed by "{victimName}"',
  },

  sosStatus: {
    active: 'Active',
    resolved: 'Resolved',
    cancelled: 'Cancelled',
  },

  notificationStatus: {
    sent: 'Sent',
    received: 'Received',
    accepted: 'Accepted',
    ignored: 'Ignored',
  },

  audioConnectedSuccess: 'Audio connected successfully',
  audioConnectedError: 'Error connecting audio',
  justNow: 'Just now',
  minutesAgo: 'minutes ago',
  hoursAgo: 'hours ago',
  daysAnd: 'days and',
  hoursAnd: 'hours and',
  iosNotSafariWarning:
    'For the best experience on iOS, please use Safari browser.',
  openInSafari: 'Open in Safari',
  useSafariTitle: 'Use Safari for Best Experience',
  useSafariMessage:
    'For the best and most secure experience, we recommend using Safari on your iOS device. Would you like to open Safari now?',
  openSafari: 'Open Safari',
  failedToOpenSafari:
    'Failed to open Safari. Please open Safari manually and navigate to this website.',
  resendOTP: 'Resend OTP',

  // Dashboard Page
  safetyTip: 'Safety Tip',
  safetyTip1: 'Always be aware of your surroundings.',
  safetyTip2: 'Share your location with trusted friends when going out.',
  safetyTip3: 'Keep emergency numbers easily accessible.',
  safetyTip4: 'Trust your instincts. If something feels off, leave the area.',
  safetyTip5: 'Ensure your phone is always charged when going out.',

  emergencyServices: 'Emergency Services',
  police: 'Police',
  ambulance: 'Ambulance',
  fireDepartment: 'Fire Dept.',
  womenHelpline: 'Women Helpline',

  volunteerStatus: 'Volunteer Status',
  volunteerAvailable: 'Available for Community Assistance',
  volunteerUnavailable: 'Unavailable for Community Assistance',
  volunteerStatusUpdated: 'Volunteer status updated successfully',
  volunteerStatusUpdateFailed: 'Failed to update volunteer status',

  nearbyVolunteers: 'Nearby Volunteers',
  viewAll: 'View All',
  volunteersNearby: 'volunteers nearby',

  // CommunityImpactPage
  communityImpact: 'Community Impact',
  yourReferralId: 'Your Referral ID',
  peopleYouHaveEncouraged: 'People You Have Encouraged',
  locationsSecured: 'Locations Secured',

  // Add these keys
  referredBy: 'Referred By',
  referralIdNotFound: 'Referral ID not found',
  referralIdValidationFailed: 'Failed to validate referral ID',

  // Added translations for form validation
  fieldRequired: 'This field is required',
  fillAllFields: 'Please fill in all fields',
  errorJoiningCommunity:
    'An error occurred while joining the community. Please try again.',

  // Added translations for DashboardPage
  errorGettingLocation: 'Error getting location. Please try again.',
  locationPermissionDenied:
    'Location permission denied. Please enable location access in your settings.',
  errorFetchingVolunteers:
    'Error fetching nearby volunteers. Please try again.',
  locationPermissionRequired:
    'Location permission is required to find nearby volunteers.',
  retry: 'Retry',
};
