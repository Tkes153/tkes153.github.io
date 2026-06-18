/**
 * CloudBase Configuration
 * Replace 'YOUR_ENV_ID' with your CloudBase environment ID.
 *
 * To get your env ID:
 * 1. Go to https://console.cloud.tencent.com/tcb
 * 2. Open your environment → Settings → Environment Info
 * 3. Copy the environment ID (format: xxx-xxx)
 */

var cloudbaseConfig = {
  env: 'nightmare-d3g0te9us2fa64796',
  region: 'ap-shanghai'
};

// Initialize CloudBase
var app = cloudbase.init(cloudbaseConfig);
var auth = app.auth();
var db = app.database();

console.log('CloudBase initialized with env:', cloudbaseConfig.env);
