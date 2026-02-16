# 🌐 Deploy Plaza Rent App on Shared Hosting (cPanel)

## 📋 Quick Summary

| Step | Action |
|------|--------|
| 1 | Build the app locally |
| 2 | Upload `dist` folder to cPanel |
| 3 | Configure `.htaccess` |
| 4 | Done! |

---

## 🚀 Step-by-Step Deployment

### Step 1: Build the App Locally

Open terminal in project folder and run:

```bash
npm install
npm run build
```

This creates a `dist` folder with all files.

---

### Step 2: Login to cPanel

1. Go to your hosting panel: `https://yourdomain.com/cpanel` or `https://yourdomain.com:2083`
2. Enter your username and password
3. Look for **File Manager**

---

### Step 3: Upload Files

#### Option A: Using File Manager (Easy)

1. Open **File Manager** in cPanel
2. Navigate to `public_html` folder
3. If installing on subdomain/subfolder:
   - Main domain: `public_html/`
   - Subdomain: `public_html/rent/` or `public_html/plaza/`
4. Click **Upload** button
5. Upload ALL files from your local `dist` folder:
   ```
   dist/
   ├── index.html
   ├── assets/
   │   ├── index-xxxxx.js
   │   └── index-xxxxx.css
   ├── manifest.json
   ├── sw.js
   └── icons/
   ```

#### Option B: Using FTP (Faster for many files)

1. Open **FTP Accounts** in cPanel
2. Note your FTP details:
   - Host: `ftp.yourdomain.com`
   - Username: your cPanel username
   - Password: your cPanel password
   - Port: 21
3. Use FileZilla or any FTP client
4. Connect and upload `dist` folder contents to `public_html`

#### Option C: Using ZIP Upload (Fastest)

1. On your computer, ZIP the entire `dist` folder contents
2. In cPanel File Manager, go to `public_html`
3. Click **Upload** → upload the ZIP file
4. Right-click the ZIP → **Extract**
5. Delete the ZIP file after extraction

---

### Step 4: Create .htaccess File

In `public_html` folder, create/edit `.htaccess` file:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle Authorization Header
  RewriteCond %{HTTP:Authorization} .
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
  
  # Redirect Trailing Slashes
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)/$ /$1 [L,R=301]
  
  # Handle React Router (SPA)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
  
  # Cache static assets
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public"
  </FilesMatch>
</IfModule>

# Enable Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

### Step 5: Verify Installation

1. Open your domain: `https://yourdomain.com`
2. You should see the login page
3. Test login with:
   - Username: `admin`
   - Password: `admin123`

---

## 📁 Final Folder Structure on cPanel

```
public_html/
├── index.html          ← Main HTML file
├── .htaccess           ← Routing configuration
├── manifest.json       ← PWA manifest
├── sw.js               ← Service worker
├── assets/
│   ├── index-abc123.js   ← JavaScript bundle
│   └── index-xyz789.css  ← CSS styles
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
└── uploads/            ← Create this folder for file uploads
    ├── tenants/
    ├── payments/
    └── leases/
```

---

## 🌍 Installing on Subdomain

### Example: `rent.yourdomain.com`

1. In cPanel, go to **Subdomains**
2. Create subdomain: `rent`
3. Document root: `public_html/rent`
4. Upload `dist` files to `public_html/rent/`
5. Create `.htaccess` in `public_html/rent/`

---

## 📂 Installing in Subfolder

### Example: `yourdomain.com/plaza`

1. Create folder: `public_html/plaza/`
2. Upload `dist` files there
3. Update `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /plaza/
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

4. Update `vite.config.ts` before building:

```typescript
export default defineConfig({
  base: '/plaza/',
  // ... rest of config
})
```

5. Rebuild: `npm run build`

---

## 🔒 Enable HTTPS (SSL)

1. In cPanel, go to **SSL/TLS** or **Let's Encrypt**
2. Click **Issue** or **Install** certificate
3. Select your domain
4. Click **Install**
5. In **Domains** section, enable **Force HTTPS**

---

## 📱 Install PWA After Deployment

Once deployed with HTTPS:

### On Mobile (Android):
1. Open website in Chrome
2. Tap menu (⋮) → **Add to Home Screen**
3. Tap **Install**

### On Mobile (iPhone):
1. Open website in Safari
2. Tap Share button → **Add to Home Screen**
3. Tap **Add**

### On Desktop (Chrome):
1. Open website
2. Click install icon in address bar
3. Click **Install**

---

## 🛠️ Troubleshooting

### Problem: Blank White Page
**Solution:** Check if all files uploaded correctly
```
Check: index.html exists in public_html
Check: assets folder has .js and .css files
```

### Problem: 404 on Page Refresh
**Solution:** `.htaccess` not working
```
Check: .htaccess file exists
Check: mod_rewrite is enabled (ask hosting support)
```

### Problem: CSS/JS Not Loading
**Solution:** Check file paths
```
Open browser console (F12)
Look for 404 errors
Verify assets folder uploaded
```

### Problem: PWA Not Installing
**Solution:** HTTPS required
```
Enable SSL certificate
Force HTTPS redirect
```

### Problem: "Not Secure" Warning
**Solution:** Install SSL
```
Go to cPanel → SSL/TLS → Install Let's Encrypt
```

---

## 📞 Quick Checklist

- [ ] Built app with `npm run build`
- [ ] Uploaded all `dist` folder contents
- [ ] Created `.htaccess` file
- [ ] SSL/HTTPS enabled
- [ ] Tested login works
- [ ] Tested page refresh works
- [ ] Tested on mobile

---

## 🎯 Common Hosting Providers

| Provider | cPanel URL |
|----------|------------|
| Bluehost | `yourdomain.com/cpanel` |
| HostGator | `yourdomain.com/cpanel` |
| GoDaddy | `yourdomain.com/cpanel` |
| Namecheap | `server.namecheap.com/cpanel` |
| SiteGround | `tools.siteground.com` |
| A2 Hosting | `yourdomain.com/cpanel` |
| Hostinger | `hpanel.hostinger.com` |

---

## 💰 Recommended Hosting (Low Cost)

| Provider | Price | SSL | Best For |
|----------|-------|-----|----------|
| Hostinger | $2.99/mo | ✅ Free | Budget |
| Namecheap | $2.88/mo | ✅ Free | Beginners |
| A2 Hosting | $2.99/mo | ✅ Free | Speed |
| SiteGround | $3.99/mo | ✅ Free | Support |

---

## 🎉 Done!

Your Plaza Rent Management App is now live at:
- Main domain: `https://yourdomain.com`
- Or subdomain: `https://rent.yourdomain.com`
- Or subfolder: `https://yourdomain.com/plaza`

**Login:** admin / admin123

---

## 📧 Need Help?

If you face issues:
1. Check browser console for errors (F12)
2. Verify all files uploaded
3. Contact hosting support for mod_rewrite
4. Ensure SSL is enabled for PWA

