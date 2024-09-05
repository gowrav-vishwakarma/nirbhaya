// This is just an example,
// so you can safely delete all default props below

export default {
  // App-wide
  'app.name': 'Shoutout',
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
  },

  // Navigation
  dashboard: 'Dashboard',
  account: 'Account',
  notifications: 'Notifications',
  help: 'Help',

  // Login Page
  mobileNumber: 'Mobile Number',
  enterOTP: 'Enter OTP',
  sendOTP: 'Send OTP',
  loginFailed: 'Login failed. Please check your OTP and try again.',
  otpSendFailed: 'Failed to send OTP. Please try again.',

  // Dashboard Page
  welcome: 'What Happened {name}?',
  sosButton: 'SOS',
  missingPermissions: 'Some permissions are missing',
  request: 'Request {permission}',
  helpFor: 'Help for {permission}',

  // Account Page
  name: 'Name',
  city: 'City',
  userType: 'User Type',
  emergencyContacts: 'Emergency Contacts',
  emergencyContactsHelp:
    'Add up to 3 emergency contacts who will be notified in case of an emergency.',
  addEmergencyContact: 'Add Emergency Contact',
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

  // Permissions
  appPermissions: 'App Permissions',
  location: 'Location',
  camera: 'Camera',
  microphone: 'Microphone',
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

  // Threat Types
  followedBySomeone: 'Followed by Someone',
  verbalHarassment: 'Verbal Harassment',
  physicalThreat: 'Physical Threat',
  attemptedKidnapping: 'Attempted Kidnapping',
  sexualAssault: 'Sexual Assault',
  domesticViolence: 'Domestic Violence',

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

  // Notifications Page
  noNotificationsFound: 'No notifications found.',
  status: 'Status',
  threat: 'Threat',
  accept: 'Accept',
  follow: 'Follow',
  notificationAcceptedSuccess: 'Notification accepted successfully',
  notificationAcceptedError: 'Failed to accept notification',

  notificationTitles: {
    volunteerNearby: 'Nearby {eventType} alert',
    emergencyContact: 'Emergency contact "{victimName}" alert: {eventType}',
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
};
