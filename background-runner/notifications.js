addEventListener('fetchNotifications', async (resolve, reject) => {
  try {
    const response = await fetch('/auth/notifications/unread-count');
    const count = await response.json();

    // You can use CapacitorNotifications to show a local notification if needed
    CapacitorNotifications.schedule([
      {
        id: 1,
        title: 'New Notifications',
        body: `You have ${count} unread notifications`,
      },
    ]);

    resolve();
  } catch (error) {
    console.error('Error fetching notifications in background:', error);
    reject(error);
  }
});
