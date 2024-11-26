<template>
  <div class="tnc-container">
    <h1 class="tnc-title">Terms, Conditions & Privacy Policy</h1>

    <div class="tnc-content">
      <section>
        <h2>1. Introduction</h2>
        <p>Welcome to SOS Bharat (the "App"), a product of Xavoc Technocrats Pvt. Ltd. ("Company," "we," "our," or
          "us").
          SOS Bharat (sosbharat.com) is a brand owned and operated by Xavoc Technocrats Pvt. Ltd. (xavoc.com).
          By accessing and using the application, you agree to be bound by these Terms and Conditions and Privacy
          Policy.</p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>2.1 Personal Information</h3>
        <ul>
          <li>Name</li>
          <li>Phone number (for OTP verification)</li>
          <li>Email address (for secondary verification)</li>
          <li>Emergency contacts (with their explicit consent)</li>
          <li>Device ID</li>
          <li>Location data (only when specifically activated)</li>
        </ul>

        <h3>2.2 Location Data Collection</h3>
        <p>We collect location data only in two specific scenarios:</p>
        <ul>
          <li>When you press the SOS button</li>
          <li>When you choose to register as a volunteer at a specific location</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <h3>3.1 Core Functionality</h3>
        <ul>
          <li>User authentication and verification</li>
          <li>Emergency response coordination</li>
          <li>Volunteer notification system</li>
          <li>News content personalization</li>
        </ul>

        <h3>3.2 Emergency Contact System</h3>
        <ul>
          <li>Emergency contacts must explicitly accept their role</li>
          <li>During emergencies, we share:
            <ul>
              <li>With emergency contacts: User's name and location</li>
              <li>With volunteers: Only approximate distance</li>
              <li>Audio broadcasts: Available only to accepted volunteers</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Data Storage and Security</h2>
        <p>All data is stored in Indian data centers with industry-standard security measures and encryption both in
          transit and at rest.</p>
      </section>

      <section>
        <h2>5. Your Rights and Data Deletion</h2>
        <p>You have the right to request data deletion through profile settings. The deletion process includes:</p>
        <ul>
          <li>Immediate removal from active systems</li>
          <li>Permanent deletion within 90 days</li>
          <li>Deletion of all media content</li>
          <li>Email confirmation upon completion</li>
        </ul>
      </section>

      <section>
        <h2>6. Volunteer System</h2>
        <p>The volunteer system operates under the following conditions:</p>
        <ul>
          <li>No formal verification process currently implemented</li>
          <li>Location sharing limited to emergency events</li>
          <li>Rating system may affect volunteer status</li>
          <li>We reserve the right to suspend volunteer status based on feedback</li>
        </ul>
      </section>

      <section>
        <h2>7. Legal Compliance</h2>
        <p>This policy complies with:</p>
        <ul>
          <li>Information Technology Act, 2000</li>
          <li>Information Technology Rules, 2011</li>
          <li>Personal Data Protection Bill guidelines</li>
          <li>Other applicable Indian laws and regulations</li>
        </ul>
      </section>

      <section>
        <h2>8. Contact Information</h2>
        <p>For questions about this privacy policy or to exercise your rights, please contact:</p>
        <p>Xavoc Technocrats Pvt. Ltd.</p>
        <ul>
          <li>Website: www.xavoc.com</li>
          <li>Brand Website: www.sosbharat.com</li>
        </ul>
      </section>

      <section>
        <h2>9. Updates to Policy</h2>
        <p>We may update this policy periodically. Users will be notified of significant changes via in-app
          notifications,
          email notifications, and app store updates.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tnc-container {
  max-width: 90vw;
  margin: 0 auto;
  padding: 2vw;
}

.tnc-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: clamp(24px, 3vw, 36px);
}

.tnc-content {
  background: #fff;
  padding: 5vw;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

section {
  margin-bottom: 3vw;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5vw;
  font-size: clamp(20px, 2.5vw, 30px);
}

h3 {
  color: #34495e;
  margin: 1.5vw 0 1vw;
  font-size: clamp(18px, 2vw, 24px);
}

p {
  line-height: 1.6;
  color: #666;
  margin-bottom: 1vw;
  font-size: clamp(16px, 1.5vw, 18px);
}

ul {
  padding-left: 2vw;
  color: #666;
  margin-bottom: 1vw;
}

ul ul {
  margin-top: 0.5vw;
}

li {
  margin-bottom: 0.8vw;
  font-size: clamp(16px, 1.5vw, 18px);
}

/* Responsive adjustments for different screen sizes */
@media screen and (max-width: 768px) {
  .tnc-container {
    max-width: 95vw;
    padding: 3vw;
  }

  .tnc-title {
    font-size: clamp(22px, 5vw, 28px);
  }

  h2 {
    font-size: clamp(20px, 4vw, 24px);
  }

  h3 {
    font-size: clamp(18px, 3.5vw, 22px);
  }

  p,
  li {
    font-size: clamp(16px, 3vw, 18px);
  }
}

@media screen and (max-width: 480px) {
  .tnc-container {
    max-width: 100vw;
    padding: 20px;
  }

  .tnc-content {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 15px;
  }

  section {
    /* padding: 20px 0; */
    margin-bottom: 0;
  }

  .tnc-title {
    font-size: clamp(20px, 6vw, 24px);
    /* padding: 20px 0; */
    /* margin-bottom: 20px; */
  }

  h2 {
    font-size: clamp(18px, 5vw, 22px);
    /* padding: 10px 0; */
    margin-bottom: 15px;
  }

  h3 {
    font-size: clamp(16px, 4.5vw, 20px);
    /* padding: 10px 0; */
    margin: 15px 0 10px;
  }

  p {
    padding: 5px 0;
    /* margin-bottom: 15px; */
    font-size: clamp(14px, 4vw, 16px);
  }

  ul {
    padding: 0 0 0 20px;
    margin: 15px 0;
  }

  li {
    padding: 5px 0;
    margin-bottom: 10px;
    font-size: clamp(14px, 4vw, 16px);
  }
}

/* Ensure text remains readable on very small devices */
@media screen and (max-width: 320px) {
  .tnc-title {
    font-size: 20px;
    padding: 20px;

  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 16px;
  }

  p,
  li {
    font-size: 14px;
  }
}

/* Font smoothing for better readability */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
</style>

<script>
export default {
  name: 'TncPage'
}
</script>
