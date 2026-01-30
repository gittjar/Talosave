# Azure Blob Storage Setup Instructions

## Prerequisites
- Azure Storage Account (can use existing or create new)
- Azure Portal access

## Setup Steps

### 1. Create or Use Existing Storage Account
1. Go to Azure Portal (https://portal.azure.com)
2. Navigate to "Storage accounts"
3. Either use existing storage account or create new:
   - Click "+ Create"
   - Select subscription and resource group
   - Enter storage account name (must be globally unique)
   - Select region (same as your other Azure resources)
   - Performance: Standard
   - Redundancy: LRS (Locally Redundant Storage) is sufficient
   - Click "Review + Create"

### 2. Create Blob Container
1. Open your Storage Account
2. Click "Containers" in left menu
3. Click "+ Container"
4. Name: `renovation-images` (or use custom name in .env)
5. Public access level: **Blob (anonymous read access for blobs only)**
6. Click "Create"

### 3. Get Connection String
1. In Storage Account, click "Access keys" in left menu
2. Click "Show" next to key1 connection string
3. Copy the entire connection string
4. Paste into `.env` file:
   ```
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=yourkey;EndpointSuffix=core.windows.net
   ```

### 4. Update Container Name (if different)
If you used a different container name than `renovation-images`, update in `.env`:
```
AZURE_STORAGE_CONTAINER_NAME=your-container-name
```

### 5. Restart Backend Server
After updating .env, restart the Node.js server:
```bash
node server.js
```

## Testing
1. Open frontend application
2. Navigate to a renovation
3. Click "Lisää kuva"
4. Select "Lataa tiedosto" tab
5. Choose an image from your device
6. Click "Lataa kuva"
7. Image should upload to Azure Blob Storage and appear in gallery

## Fallback Mode
If Azure Storage is not configured:
- App will show error message for direct uploads
- URL-based uploads will still work
- Users can upload images to any cloud storage and paste URLs

## Security Notes
- Connection string contains sensitive credentials - keep .env file secure
- Never commit .env to version control
- Container public access is required for images to be viewable
- Consider using SAS tokens for additional security in production

## Cost Considerations
- Azure Blob Storage pricing: ~$0.018 per GB/month (LRS)
- First 5GB is typically included in free tier
- Transaction costs are minimal for typical usage
- Monitor usage in Azure Portal -> Cost Management

## Troubleshooting
- **"Azure Blob Storage ei ole konfiguroitu"**: Check AZURE_STORAGE_CONNECTION_STRING in .env
- **Upload fails**: Verify container exists and connection string is correct
- **Images not visible**: Check container public access level is set to "Blob"
- **Connection error**: Verify firewall/network allows access to Azure Storage
