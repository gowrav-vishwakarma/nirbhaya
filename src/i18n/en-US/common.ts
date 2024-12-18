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
  language: 'Select Language',
  languages: {
    'en-US': 'English',
    'hi-IN': 'हिंदी',
    'gu-IN': 'ગુજરાતી',
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
  betaNotice:
    'Beta Version (Under testing, may have issues), to give suggestions click here',
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
  // Profile Page
  myProfile: 'My Profile',
  emergencyContact: 'Emergency Contact',
  beVolunteers: 'Become Volunteers',
  // communityImpact: 'Community Impact',
  sosHistory: 'SOS History',
  sosSetting: 'SOS Setting',
  name: 'Name',
  city: 'City',
  state: 'State',
  userType: 'Age Group',
  dob: 'Date Of Birth',
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
  tech: 'Tech',
  nurse: 'Nurse',
  student: 'Student',
  freelancer: 'Freelancer',
  onlineSeller: 'Online Seller',
  handicraftMaker: 'Handicraft Maker',
  tailor: 'Tailor',
  beautician: 'Beautician',
  foodSeller: 'Food Seller',
  artsMediaDesigner: 'Arts, Media & Design Creator',
  skilledTradesWorker: 'Skilled Trades Worker',
  shopOwner: 'Shop Owner',
  techITProfessional: 'Technology & IT Professional',
  healthcareMedicalWorker: 'Healthcare & Medical Worker',
  socialWorker: 'Social Worker',
  privateSectorEmployee: 'Private Sector Employee',
  governmentEmployee: 'Government Employee',
  businessOwner: 'Business Owner',
  housewife: 'Housewife',
  retired: 'Retired',
  unemployed: 'Unemployed',
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
  emergencyContactsInformed: 'Informed',
  helpUsMore: 'Help us understand the situation better',
  currentLocation: 'Current Location',
  gettingLocation: 'Getting your location...',
  coordinates: 'Coordinates',
  nearbyPoliceStations: 'Nearby Police Stations',
  contactPoliceStation: 'Contact Police Station',
  resolveSOSIssue: 'Resolve SOS Issue',
  audioOpen: 'Audio Open',
  clickToOpenAudio: 'Click to Open Audio',
  sosMode: 'SOS Alert Sent Successfully',
  sosCountdownMessage: '',
  notifiedPersons: 'Notified',
  // notifiedPersons: 'Notified to persons',
  acceptedPersons: 'Accepted',
  // acceptedPersons: 'Accepted by persons',
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
  gettingStarted: 'Getting started',
  gettingStartedContent: 'getting started content',
  watchVideo: 'watch Video',
  usingSOS: 'Using SOS',
  usingSOSContent: 'using SOS Content',
  volunteeringHelp: 'Volunteering help',
  volunteeringHelpContent: 'volunteering help content',
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
  onlyNumbersAllowed: 'Only numbers are allowed',
  invalidPhoneNumberLength: 'Phone number must be 10 digits',
  unexpectedError: 'An unexpected error occurred',
  cantAddOwnNumber: 'Cant Add Own Number',
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
  // locationError: 'Error getting location',
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
  emergencyServices: 'Call to Emergency Services',
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
  referredBy: 'Referral Code',
  referralIdNotFound: 'Referral ID not found',
  referralIdValidationFailed: 'Failed to validate referral ID',
  // Added translations for form validation
  fieldRequired: 'This field is required',
  fillAllFields: 'Please fill in all fields',
  errorJoiningCommunity:
    'An error occurred while joining the community. Please try again.',
  // Added translations for DashboardPage
  timeRangeLabel: 'Time Range',
  timeRange: {
    live: 'Live',
    last3Hours: 'Last 3 Hours',
    today: 'Today',
    last2Days: 'Last 2 Days',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    custom: 'Custom',
  },
  selectDateRange: 'Select Date Range',
  tapToSelect: 'Tap to select',
  // country: 'Country',
  noCitiesFound: 'No cities found',
  addToHomeScreen:
    'For a better experience, please install this app by adding it to your home screen.',
  installApp: 'Install App',
  install: 'Install',
  notNow: 'Not Now',
  Tnc: 'Terms & Conditions',
  welcomeMessage: "Welcome to SOS App! We're here to help keep you safe.",
  loadMore: 'Load More',
  errorLoadingMore: 'Failed to load more items',
  acceptTerms: 'I accept the T&C, privacy policy & EULA',
  // acceptTerms: 'I ACCEPT THE T&C, PRIVACY POLICY & EULA',
  sosAudioStarted: 'SOS Audio Started',
  contactRemoved: 'Contact Removed',
  contactApproved: 'Contact Approved',

  sosButtonNote_label: 'Press SOS Button to inform your emergency contacts.',
  sosButtonNote_descTitle: 'SOS Button Description:',
  sosButtonNote_H1: 'SOS Button: ',
  sosButtonNote_H1Desc:
    'Pressing the SOS button will send a notification to your added emergency contacts, alerting them of your SOS Event and location (if shared).',
  sosButtonNote_H2: 'Important Note: ',
  sosButtonNote_H2Desc:
    'This is a secondary SOS service. Please contact primary emergency services first, such as the police or official helpline numbers, for immediate assistance.',
  sosButtonNote_H3: 'Disclaimer: ',
  sosButtonNote_H3Desc:
    'We do not contact or alter any primary emergency services on your behalf. Our role is limited to notifying the emergency contacts you have added and based on your permission notifying nearby volunteers.',
  retry: 'Retry',

  noVolunteersNearby: 'noVolunteersNearby',
  viewOnMap: 'View on Map',
  awayFrom: 'awayFrom',
  pending: 'Pending',
  leaderboard: 'Leaderboard',
  selectScope: 'Select Scope',
  selectVolunteeringLocation: 'Select Volunteering Location',
  selectRadius: 'Select Radius',
  selectRegion: 'Select Region',
  byLocation: 'By Location',
  byRegion: 'By Administrative Region',
  showLeaderboard: 'Show Leaderboard',
  noLeaderboardData: 'No leaderboard data available',
  errorFetchingLeaderboard: 'Error fetching leaderboard data',
  score: 'Score',
  you: 'You',
  noVolunteeringLocations: 'No volunteering locations found',
  yourScore: 'Your Score',
  totalScore: 'Total Score',
  referrals: 'Referrals',
  referralLocations: 'Referral Locations',
  volunteerLocations: 'Volunteer Locations',
  locationsVolunteering: 'locations where you volunteer',
  yourActivity: 'Your Activity',
  referralsActivity: 'Referrals Activity',
  points: 'points',
  days: 'days',
  peopleReferred: 'people referred',
  locationsAdded: 'locations added',
  daysActive: 'days active this month',
  totalDaysActive: 'total days active by referrals',
  clickToShowDetails: 'Click to show details',
  clickToHideDetails: 'Click to hide details',
  locationTooClose:
    'Location must be at least 500 meters away from other locations',
  viewLeaderboard: 'View Leaderboard',
  viewSOSEventsMap: 'View SOS Events Map',
  confirmDeleteContact:
    'Are you sure you want to delete this emergency contact?',
  delete: 'Remove',
  contactDeletedSuccess: 'Emergency contact deleted successfully',
  addBusinessDetails: 'Add Business Details',
  businessName: 'Business Name',
  businessNameRequired: 'Business name is required',
  whatsappNumber: 'WhatsApp Number',
  whatsappNumberRequired: 'WhatsApp number is required',
  invalidPhoneNumber: 'Please enter a valid 10-digit phone number',
  // businessLocationName: 'Business Location Name',
  businessLocationRequired: 'Business location is required',
  // useCurrentLocation: 'Use Current Location',
  // currentLocation: 'Current Location',
  // locationUpdated: 'Location updated successfully',
  locationError: 'Failed to get location. Please try again.',
  businessInfoSaved: 'Business information saved successfully',
  businessInfoError: 'Failed to save business information',
  businessInfoRemoved: 'Business information removed successfully',
  businessInfoRemoveError: 'Failed to remove business information',
  confirmRemove: 'Confirm Removal',
  confirmRemoveBusinessMessage:
    'Are you sure you want to remove your business information?',
  locationCaptured: 'Location captured successfully',
  locationPermissionDenied:
    'Location permission denied. Please enable location access.',
  locationUnavailable: 'Location unavailable. Please try again.',
  locationTimeout: 'Location request timed out. Please try again.',
  locationCoordinates: 'Location Coordinates',
  latitude: 'Latitude',
  longitude: 'Longitude',
  businessInfoUpdateSuccess: 'Business information updated successfully',
  businessInfoUpdateError: 'Failed to update business information',
  businessInfoDeleteSuccess: 'Business information deleted successfully',
  businessInfoDeleteError: 'Failed to delete business information',
  businessHours: 'Business Hours',
  businessCategory: 'Business Category',
  businessDescription: 'Business Description',
  businessAddress: 'Business Address',
  businessWebsite: 'Business Website',
  businessEmail: 'Business Email',
  businessPhone: 'Business Phone',
  businessSocialMedia: 'Social Media Links',
  addSocialMedia: 'Add Social Media',
  removeSocialMedia: 'Remove Social Media',
  invalidBusinessEmail: 'Please enter a valid email address',
  invalidBusinessPhone: 'Please enter a valid phone number',
  invalidBusinessWebsite: 'Please enter a valid website URL',
  businessInfoValidationError: 'Please fix the errors in the form',
  businessInfoRequired: 'Please fill in all required fields',
  businessInfoOptional: 'Optional Information',
  businessInfoMandatory: 'Mandatory Information',
  businessInfoSaving: 'Saving business information...',
  businessInfoDeleting: 'Deleting business information...',
  businessInfoUpdating: 'Updating business information...',
  confirmBusinessInfoDelete:
    'Are you sure you want to delete your business information? This action cannot be undone.',
  businessInfoDeleteConfirm: 'Yes, Delete',
  businessInfoDeleteCancel: 'No, Keep',

  // Business Location related translations
  businessLocation: 'Business Location',
  addBusinessLocation: 'Add Business Location',
  editBusinessLocation: 'Edit Business Location',
  removeBusinessLocation: 'Remove Business Location',
  businessLocationAddress: 'Business Location Address',
  // businessLocationRequired: 'Business location is required',
  businessLocationNameRequired: 'Location name is required',
  businessLocationAddressRequired: 'Location address is required',
  businessLocationUpdated: 'Business location updated successfully',
  businessLocationUpdateError: 'Failed to update business location',
  businessLocationRemoved: 'Business location removed successfully',
  businessLocationRemoveError: 'Failed to remove business location',
  businessLocationExists: 'Business location already exists',
  businessLocationNotFound: 'Business location not found',
  businessLocationTooClose:
    'Location is too close to existing business location',
  selectBusinessLocation: 'Select Business Location',
  confirmRemoveLocation:
    'Are you sure you want to remove this business location?',
  businessLocationSaved: 'Business location saved successfully',
  businessLocationError: 'Failed to save business location',
  businessLocationValidationError: 'Please fix the location errors',
  businessLocationCoordinates: 'Business Location Coordinates',
  businessLocationLatitude: 'Business Location Latitude',
  businessLocationLongitude: 'Business Location Longitude',
  businessLocationDistance: 'Distance from current location',
  businessLocationMap: 'View on Map',
  businessLocationDirections: 'Get Directions',
  businessLocationSearch: 'Search Business Locations',
  noBusinessLocationsFound: 'No business locations found',
  businessLocationLimit: 'Maximum number of business locations reached',
  businessLocationMinDistance: 'Minimum distance between locations:',
  businessLocationMaxDistance: 'Maximum distance between locations:',
  businessLocationCurrentLocation: 'Use Current Location as Business Location',
  businessLocationPermissionRequired:
    'Location permission required to add business location',

  // Add the missing translation for getCurrentLocation
  getCurrentLocation: 'Get Current Location',

  // Business Info related translations
  addBusinessInfo: 'Add Business Information',
  businessInfo: 'Business Information',
  businessDetails: 'Business Details',
  // businessName: 'Business Name',
  // businessNameRequired: 'Business name is required',
  // whatsappNumber: 'WhatsApp Number',
  whatsappRequired: 'WhatsApp number is required',
  phoneLength: 'Phone number must be 10 digits',
  // businessLocation: 'Business Location',
  locationRequired: 'Location is required',
  // getCurrentLocation: 'Get Current Location',
  // businessLocationName: 'Business Location Name',
  // businessLocationRequired: 'Business location is required',
  // currentLocation: 'Current Location',
  // locationUpdated: 'Location updated successfully',
  // locationError: 'Failed to get location. Please try again.',
  // businessInfoSaved: 'Business information saved successfully',
  // businessInfoError: 'Failed to save business information',
  // businessInfoRemoved: 'Business information removed successfully',
  // businessInfoRemoveError: 'Failed to remove business information',
  // confirmRemove: 'Confirm Removal',
  // confirmRemoveBusinessMessage:
  //   'Are you sure you want to remove your business information?',
  // pleaseSelectLocation: 'Please select a location first',
  // locationCaptured: 'Location captured successfully',
  // locationPermissionDenied:
  //   'Location permission denied. Please enable location access.',
  // locationUnavailable: 'Location unavailable. Please try again.',
  // locationTimeout: 'Location request timed out. Please try again.',
  // locationCoordinates: 'Location Coordinates',
  // latitude: 'Latitude',
  // longitude: 'Longitude',
  // businessInfoUpdateSuccess: 'Business information updated successfully',
  // businessInfoUpdateError: 'Failed to update business information',
  // businessInfoDeleteSuccess: 'Business information deleted successfully',
  // businessInfoDeleteError: 'Failed to delete business information',
  // businessHours: 'Business Hours',
  // businessCategory: 'Business Category',
  // businessDescription: 'Business Description',
  // businessAddress: 'Business Address',
  // businessWebsite: 'Business Website',
  // businessEmail: 'Business Email',
  // businessPhone: 'Business Phone',
  // businessSocialMedia: 'Social Media Links',
  // addSocialMedia: 'Add Social Media',
  // removeSocialMedia: 'Remove Social Media',
  // invalidBusinessEmail: 'Please enter a valid email address',
  // invalidBusinessPhone: 'Please enter a valid phone number',
  // invalidBusinessWebsite: 'Please enter a valid website URL',
  // businessInfoValidationError: 'Please fix the errors in the form',
  // businessInfoRequired: 'Please fill in all required fields',
  // businessInfoOptional: 'Optional Information',
  // businessInfoMandatory: 'Mandatory Information',
  // businessInfoSaving: 'Saving business information...',
  // businessInfoDeleting: 'Deleting business information...',
  // businessInfoUpdating: 'Updating business information...',
  // confirmBusinessInfoDelete:
  //   'Are you sure you want to delete your business information? This action cannot be undone.',
  // businessInfoDeleteConfirm: 'Yes, Delete',
  // businessInfoDeleteCancel: 'No, Keep',

  // Business related translations
  businessSettings: 'Business Settings',
  // businessName: 'Business Name',
  // whatsappNumber: 'WhatsApp Number',
  // locationName: 'Location Name',
  // useCurrentLocation: 'Use Current Location',
  // coordinates: 'Coordinates',
  // locationUpdated: 'Location updated successfully',
  // locationError: 'Failed to get location. Please try again.',
  businessInformation: 'Business Information',
  addBusinessInformation: 'Add Business Information',
  businessLocationHelp:
    'Add your business information to promote your business.',

  userNotRegisteredInApp: 'This phone number is not registered in the app',

  fillRequiredFields: 'Please fill in all required fields',
  emergencyContactsUpdated: 'Emergency contacts updated successfully',
  emergencyContactsUpdateError: 'Error updating emergency contacts',
  locationUpdateSuccess: 'Location updated successfully',
};
