# Storage Quota Feature - Installation Guide

## Overview
This feature implements a per-user storage quota system for document uploads. Each user gets 50MB of free storage.

## Database Migration Required

Before using this feature, you **MUST** run the SQL migration script to add the `storageUsed` column to the `TS_Users` table.

### How to Run the Migration

1. Open SQL Server Management Studio (SSMS) or Azure Data Studio
2. Connect to your database
3. Open the file: `ts-backend/migrations/add-storage-quota.sql`
4. Execute the script

The script will:
- Add a `storageUsed` column (BIGINT) to the TS_PropertyUsers table
- Set default value to 0 for all existing users
- Check if the column already exists before adding (safe to run multiple times)

### Verification

After running the migration, you can verify it was successful by running:

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TS_PropertyUsers' AND COLUMN_NAME = 'storageUsed';
```

## Features

### Backend
- **Quota Module** (`middleware/storageQuota.js`):
  - `getUserStorageUsage(userId)` - Get current usage stats
  - `checkStorageQuota(userId, fileSize)` - Check if upload is allowed
  - `addStorageUsage(userId, fileSize)` - Increment usage after upload
  - `removeStorageUsage(userId, fileSize)` - Decrement usage after deletion

- **API Endpoints**:
  - `GET /api/storage-quota` - Get user's current storage usage and limit
  - `POST /api/upload-file` - Now checks quota before upload (returns 413 if exceeded)
  
- **Upload Endpoint Changes**:
  - Checks quota before processing file
  - Stores file size and user ID in MongoDB
  - Updates user's storage usage in SQL database after successful upload
  - Returns 413 (Payload Too Large) with descriptive error if quota exceeded

- **Delete Endpoint Changes**:
  - Decrements user's storage usage when file is deleted
  - Handles cases where file has no size/userId (old files)

### Frontend

- **Storage Quota Display**:
  - Visual progress bar showing usage (green/yellow/red based on percent)
  - Shows "XX MB / 50 MB" text
  - "Lähes täynnä" badge when over 90% used
  - Located below the upload form

- **Upload Error Handling**:
  - Detects 413 status code from server
  - Shows specific error message from backend
  - Stops uploading remaining files when quota exceeded

- **Auto-Refresh**:
  - Quota display refreshes after each upload
  - Quota display refreshes after each deletion

## Configuration

The free tier limit is defined in `ts-backend/middleware/storageQuota.js`:

```javascript
const FREE_TIER_LIMIT = 50 * 1024 * 1024; // 50MB
```

To change the limit, modify this constant and restart the server.

## Testing

1. **Check Initial Quota**: Navigate to Documents page and verify quota display shows "0.00 / 50 MB"

2. **Upload Files**: Upload some documents and watch the quota bar fill up

3. **Test Quota Limit**: Try to upload files that would exceed 50MB:
   - Should see error toast: "Tallennustila tä ynnä. Käytössä X MB / 50 MB. Poista tiedostoja vapauttaaksesi tilaa."
   - Upload should be blocked before processing

4. **Delete Files**: Delete some files and verify quota decreases

5. **API Test**: You can also test the API directly:
   ```javascript
   // Get quota (requires authentication token)
   GET http://localhost:3000/api/storage-quota
   Authorization: Bearer YOUR_TOKEN
   ```

## Troubleshooting

### "Column 'storageUsed' does not exist"
- You haven't run the migration script. See Database Migration section above.

### Quota not updating after upload/delete
- Check browser console for API errors
- Verify backend logs show "Added X bytes to user Y storage usage"
- Check that file has `fileSize` and `userId` fields in MongoDB

### Old files not counted in quota
- Files uploaded before this feature was implemented don't have `fileSize` or `userId`
- They won't count toward quota until you implement a data migration script
- They also won't free up quota when deleted

## Future Enhancements

- Add admin panel to view and modify user quotas
- Implement paid tiers with higher limits
- Add bulk recalculation script for existing files
- Email notifications when approaching quota limit
- Quota tracking for property images and renovation images
