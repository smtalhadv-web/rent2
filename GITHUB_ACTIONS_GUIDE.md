# 🚀 GitHub Actions Build Guide

## No Computer Needed! Build in Cloud & Deploy to cPanel

This guide shows how to use GitHub to automatically build your app without installing Node.js on your computer.

---

## 📋 Step-by-Step Instructions

### Step 1: Create GitHub Account

1. Go to **https://github.com**
2. Click **Sign Up**
3. Create free account

---

### Step 2: Create New Repository

1. Click **+** icon (top right) → **New repository**
2. Enter repository name: `plaza-rent-app`
3. Select **Private** (recommended)
4. Click **Create repository**

---

### Step 3: Upload Project Files

#### Option A: Using GitHub Web Interface (Easiest)

1. In your new repository, click **uploading an existing file**
2. Drag and drop ALL project files
3. Click **Commit changes**

#### Option B: Using Git Command Line

```bash
# Install Git from https://git-scm.com/

# In your project folder, run:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/plaza-rent-app.git
git push -u origin main
```

---

### Step 4: GitHub Automatically Builds! 🎉

Once you push the code:

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You'll see "Build and Deploy" running
4. Wait 2-3 minutes for it to complete ✅

---

### Step 5: Download Built Files

1. Go to **Actions** tab
2. Click on the latest **successful** workflow run (green checkmark)
3. Scroll down to **Artifacts** section
4. Download **plaza-rent-app-zip**

You'll get a ZIP file containing everything ready for cPanel!

---

### Step 6: Upload to cPanel

1. Login to cPanel
2. Open **File Manager**
3. Go to **public_html** folder
4. Delete old files (if any)
5. Click **Upload** → Upload the ZIP file
6. Right-click the ZIP → **Extract**
7. Move extracted files to `public_html` root
8. Delete the empty folder and ZIP file

---

## 🎯 Quick Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│                     GITHUB.COM                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Create Repository                                   │
│         ↓                                               │
│  2. Upload Project Files                                │
│         ↓                                               │
│  3. GitHub Actions Auto-Builds (2-3 min)               │
│         ↓                                               │
│  4. Download ZIP from Artifacts                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                       CPANEL                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  5. Upload ZIP to public_html                           │
│         ↓                                               │
│  6. Extract ZIP                                         │
│         ↓                                               │
│  7. Your App is LIVE! 🎉                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Updating Your App

Whenever you make changes:

1. Edit files on GitHub (or upload new files)
2. GitHub Actions automatically rebuilds
3. Download new ZIP
4. Upload to cPanel (replace old files)

---

## ⚡ Auto-Deploy to cPanel (Advanced)

Want GitHub to automatically upload to cPanel? Add FTP deployment:

### Step 1: Get cPanel FTP Details

From cPanel, note:
- **FTP Host:** ftp.yourdomain.com
- **FTP Username:** your_cpanel_username
- **FTP Password:** your_cpanel_password

### Step 2: Add GitHub Secrets

1. Go to repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `FTP_SERVER` = ftp.yourdomain.com
   - `FTP_USERNAME` = your_username
   - `FTP_PASSWORD` = your_password

### Step 3: Update Workflow

Edit `.github/workflows/build.yml` and add at the end:

```yaml
      - name: Deploy to cPanel via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: dist/
          server-dir: public_html/
```

Now every push automatically deploys to your website!

---

## 🔧 Manual Trigger

You can also manually trigger a build:

1. Go to **Actions** tab
2. Click **Build and Deploy**
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

---

## ❓ Troubleshooting

### Build Failed?

1. Go to **Actions** tab
2. Click on the failed run
3. Click on the failed job
4. Read the error message

Common fixes:
- Make sure all files are uploaded
- Check that `package.json` exists
- Ensure no syntax errors in code

### Can't Find Artifacts?

- Artifacts are only available for **successful** builds
- They expire after 30 days
- Make sure you're logged into GitHub

### Workflow Not Running?

- Check that `.github/workflows/build.yml` exists
- Make sure you pushed to `main` or `master` branch
- Go to Actions and manually trigger

---

## 📱 Install PWA After Deployment

Once your site is live:

1. **Enable HTTPS** in cPanel (Let's Encrypt)
2. Visit your website on phone
3. **Android:** Menu → "Add to Home Screen"
4. **iPhone:** Share → "Add to Home Screen"

The app will install like a native app!

---

## 🔐 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Owner | owner | owner123 |
| Accountant | accountant | acc123 |

---

## 📞 Need Help?

If you face any issues:

1. Check the Actions tab for error logs
2. Make sure all project files are uploaded
3. Verify cPanel settings are correct

---

## ✅ Checklist

- [ ] Created GitHub account
- [ ] Created new repository
- [ ] Uploaded all project files
- [ ] GitHub Actions build successful
- [ ] Downloaded ZIP artifact
- [ ] Uploaded to cPanel
- [ ] Enabled HTTPS/SSL
- [ ] Tested website works
- [ ] Installed PWA on phone

**Congratulations! Your app is now live! 🎉**
