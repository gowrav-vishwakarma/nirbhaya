package com.xavoc.shoutout

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        // Handle FCM messages here
        // You can create and show a notification here for background messages
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Handle new token
    }
}
