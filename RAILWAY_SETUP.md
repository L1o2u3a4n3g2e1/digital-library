# Railway Deployment Setup Guide

This guide walks you through deploying the Digital Library backend on Railway.

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected (we've already done this)
- The provided Railway project URL

## Step 1: Connect GitHub Repository

1. Go to your Railway project dashboard
2. Click "New" → "GitHub Repo"
3. Select your `digital-library` repository
4. Railway will automatically detect the Dockerfile and deploy settings

## Step 2: Configure Environment Variables

In the Railway dashboard, go to **Variables** and add the following:

### Database Variables
```
DB_HOST=     # Railway MySQL service hostname (will be provided by MySQL plugin)
DB_USER=     # MySQL username
DB_PASSWORD= # MySQL password
DB_NAME=multilingual_library
DB_PORT=3306
```

### Email Configuration
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=Digital Library
```

### SMS Configuration
```
SMS_PROVIDER=smsgateway
SMSGATEWAY_API_KEY=your-api-key
SMSGATEWAY_DEVICE_ID=your-device-id
```

### Application Settings
```
APP_NAME=Digital Library
APP_ENV=production
APP_DEBUG=false
APP_URL=<your-railway-url>         # Will be provided after first deployment
FRONTEND_URL=https://your-vercel-frontend.vercel.app
ALLOWED_ORIGINS=https://your-vercel-frontend.vercel.app,<your-railway-url>
```

### JWT & Security
```
JWT_SECRET=your-secure-random-string-at-least-32-characters
JWT_EXPIRY=86400
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY=900
MAX_UPLOAD_SIZE=52428800
UPLOAD_DIR=uploads/
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Step 3: Add MySQL Database Service

1. In Railway dashboard, click "New" → "Database" → "MySQL"
2. Railway will automatically create a MySQL service
3. The database connection string will be available as environment variables:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DB`

4. Use these values for your `DB_*` environment variables

## Step 4: Database Migration

After MySQL is running, you need to run the migration scripts:

1. In Railway dashboard, go to the **Deployments** tab
2. Click on your service and open the shell/terminal
3. Run the migration:
   ```bash
   php /app/run-migration.php
   ```

If the above doesn't work, manually create the database schema using the migration files in `/backend/`.

## Step 5: Verify Deployment

1. After deployment completes, Railway will provide you with a URL like:
   `https://digital-library-prod-abc123.railway.app`

2. Test the backend:
   ```bash
   curl https://your-railway-url/api/health
   ```

3. Update your frontend `.env` file to point to the new Railway URL:
   ```
   REACT_APP_API_BASE_URL=https://your-railway-url
   ```

4. Redeploy the frontend on Vercel to use the new API endpoint

## Step 6: Update Frontend CORS Settings

Make sure the Railway backend's CORS settings include your Vercel frontend:

Update `ALLOWED_ORIGINS` in the backend environment variables:
```
ALLOWED_ORIGINS=https://your-vercel-frontend.vercel.app,https://your-railway-url
```

## Troubleshooting

### Deployment Fails
- Check the build logs in Railway dashboard
- Ensure `Dockerfile.railway` and `Procfile` are in the root directory
- Verify all environment variables are set

### Database Connection Failed
- Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are correct
- Ensure the MySQL service is running in Railway
- Check that the database `multilingual_library` exists

### Frontend Cannot Connect to Backend
- Verify `FRONTEND_URL` in the backend matches your Vercel URL
- Check `ALLOWED_ORIGINS` includes your Vercel frontend
- Ensure `APP_URL` is set to your Railway URL

### API Returning 500 Errors
- Check the logs in Railway dashboard
- Verify all required environment variables are set
- Run the database migration if not already done

## Railway Dashboard Links

- Project: https://railway.com/project/aeeb1544-0771-419f-97bb-2aa9d41d76af
- Service: https://railway.com/project/aeeb1544-0771-419f-97bb-2aa9d41d76af/service/71016857-9fdd-4418-81fa-04f3d2bdd07f

## Next Steps

1. ✅ Code pushed to GitHub
2. ⏳ Connect GitHub to Railway (in progress)
3. ⏳ Configure environment variables
4. ⏳ Set up MySQL database
5. ⏳ Run database migration
6. ⏳ Update frontend API endpoints
7. ⏳ Verify end-to-end functionality

---

**Note:** This is a standard PHP deployment on Railway. If you encounter issues, refer to Railway's PHP documentation or check the troubleshooting section above.
