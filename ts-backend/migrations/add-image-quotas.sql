-- Add separate storage quotas for property images and renovation images
-- Documents: 50MB, Property Images: 20MB, Renovation Images: 50MB = 120MB total free tier

-- Add propertyImagesUsed column
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('TS_PropertyUsers') 
    AND name = 'propertyImagesUsed'
)
BEGIN
    ALTER TABLE TS_PropertyUsers
    ADD propertyImagesUsed BIGINT NOT NULL DEFAULT 0;
    
    PRINT 'Column propertyImagesUsed added successfully to TS_PropertyUsers table';
END
ELSE
BEGIN
    PRINT 'Column propertyImagesUsed already exists in TS_PropertyUsers table';
END

-- Add renovationImagesUsed column
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('TS_PropertyUsers') 
    AND name = 'renovationImagesUsed'
)
BEGIN
    ALTER TABLE TS_PropertyUsers
    ADD renovationImagesUsed BIGINT NOT NULL DEFAULT 0;
    
    PRINT 'Column renovationImagesUsed added successfully to TS_PropertyUsers table';
END
ELSE
BEGIN
    PRINT 'Column renovationImagesUsed already exists in TS_PropertyUsers table';
END

-- Verify the columns were added
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TS_PropertyUsers'
AND COLUMN_NAME IN ('storageUsed', 'propertyImagesUsed', 'renovationImagesUsed');
