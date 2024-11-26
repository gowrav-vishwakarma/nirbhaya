<template>
  <div class="tnc-container">
    <h1 class="tnc-title">Terms and Conditions</h1>

    <div class="tnc-content">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using the Nirbhaya SOS application, you agree to be bound by these Terms and Conditions. If
          you do not agree to these terms, please do not use the application.</p>
      </section>

      <section>
        <h2>2. Service Description</h2>
        <p>Nirbhaya SOS is a personal safety application that provides emergency assistance features. The service
          includes, but is not limited to, emergency contact alerts, location sharing, and SOS signaling.</p>
      </section>

      <section>
        <h2>3. User Responsibilities</h2>
        <p>Users must:</p>
        <ul>
          <li>Provide accurate and current information</li>
          <li>Maintain the confidentiality of their account</li>
          <li>Use the service responsibly and only for genuine emergencies</li>
          <li>Not misuse or make false emergency alerts</li>
        </ul>
      </section>

      <section>
        <h2>4. Privacy Policy</h2>
        <p>Your use of Nirbhaya SOS is also governed by our Privacy Policy. We collect and use personal information as
          described in our Privacy Policy.</p>
      </section>

      <section>
        <h2>5. Disclaimer</h2>
        <p>The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be
          uninterrupted, timely, secure, or error-free.</p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>Nirbhaya SOS shall not be liable for any indirect, incidental, special, consequential, or punitive damages
          resulting from your use or inability to use the service.</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TncPage'
}
</script>

<style scoped>
.tnc-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tnc-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.tnc-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

section {
  margin-bottom: 30px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

p {
  line-height: 1.6;
  color: #666;
}

ul {
  padding-left: 20px;
  color: #666;
}

li {
  margin-bottom: 10px;
}
</style>
