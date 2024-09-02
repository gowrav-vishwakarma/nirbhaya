// This is just an example,
// so you can safely delete all default props below

export default {
  name: 'Name',
  mobileNumber: 'Mobile Number',
  city: 'City',
  emergencyContacts: 'Emergency Contacts',
  emergencyContactsHelp:
    'Add up to 3 emergency contacts who will be notified in case of an SOS.',
  number: 'Number',
  addEmergencyContact: 'Add Emergency Contact',
  locationSharing: 'Location Sharing',
  locationSharingHelp:
    'Choose how you want to share your location for safety purposes.',
  notificationLocations: 'Get Notified for following locations',
  notificationLocationsHelp:
    'Add up to 2 locations where you want to receive notifications.',
  locationName: 'Location Name',
  address: 'Address',
  addNotificationLocation: 'Add Notification Location',
  saveChanges: 'Save Changes',
  alwaysLive: 'Always Live (Share location every 5 minutes)',
  fetchSOS: 'Fetch SOS events every 5 minutes',
  noLocationSharing: 'Do not share location',
  volunteerLocationSharing: 'Volunteer Availability',
  volunteerLocationSharingHelp:
    'Choose how you want to make yourself available as a volunteer to help others in need.',
  volunteerLocationSharingDescription:
    'As a volunteer, you can choose to share your location to help others in emergency situations. Select your preferred availability option below.',
  alwaysAvailable: 'Always Available (Update my location every 5 minutes)',
  cancelSOS: 'Cancel SOS',
  sosSent: 'SOS Sent',
  notificationSentTo: 'Notification sent to {count} nearby persons',
  acceptedBy: 'Accepted by {count} persons',
  emergencyContactsInformed: 'Emergency contacts informed',
  helpUsMore: 'Help us more',
  followedBySomeone: 'Being Followed',
  verbalHarassment: 'Verbal Harassment',
  physicalThreat: 'Physical Threat',
  attemptedKidnapping: 'Attempted Kidnapping',
  sexualAssault: 'Sexual Assault',
  domesticViolence: 'Domestic Violence',
  currentLocation: 'Current Location',
  useCurrentLocation: 'Use Current Location',
  nearbyPoliceStations: 'Nearby Police Stations',
  gettingLocation: 'Getting location...',
  contactPoliceStation: 'Contact Police Station',
  welcome: 'Welcome, {name}',
  coordinates: 'Coordinates',
  noLocationSet: 'No location set',
  language: 'Language',
  languages: {
    'en-US': 'English',
    'hi-IN': 'Hindi',
    'gu-IN': 'Gujarati',
  },
  liveSosEventChecking: 'Live SOS Event Checking',
  liveSosEventCheckingDescription:
    'Enable to check for live SOS events in your area at frequent intervals.',
  notAMember: 'Contact {contactPhone} is not a member of the app',
  profileUpdateSuccess: 'Profile updated successfully',
  userType: 'User Type',
  pwaBackgroundLocationLimited:
    'Background location tracking is limited in PWAs. Please use the native app for better experience.',
  appPermissions: 'App Permissions',
  location: 'Location',
  camera: 'Camera',
  microphone: 'Microphone',
  granted: 'Granted',
  requestPermission: 'Request Permission',
  permissionGranted: '{permission} permission granted',
  permissionDenied: '{permission} permission denied',
  backgroundLocationPermissionRequired:
    'Background location permission is required for this feature',
  profileUpdateError: 'Error updating profile',
  locationUpdated: 'Location updated',
  locationError: 'Error getting location',
  missingPermissions: 'Missing Permissions',
  request: 'Request {permission}',
  helpFor: 'Help for {permission}',
  help: 'Help',

  // Add these new keys if they're not already present
  locationPermission: 'Location Permission',
  locationPermissionHelp:
    'This app needs access to your location to provide accurate SOS services.',
  requestLocationPermission: 'Request Location Permission',

  cameraPermission: 'Camera Permission',
  cameraPermissionHelp:
    'Camera access is required to capture photos or videos during emergencies.',
  requestCameraPermission: 'Request Camera Permission',

  microphonePermission: 'Microphone Permission',
  microphonePermissionHelp:
    'Microphone access is needed to record audio during emergencies.',
  requestMicrophonePermission: 'Request Microphone Permission',

  notificationPermission: 'Notification Permission',
  notificationPermissionHelp:
    'Notifications are essential to alert you about nearby SOS events.',
  requestNotificationPermission: 'Request Notification Permission',
};
