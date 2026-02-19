-- Add storage quota tracking to TS_Users table
-- This adds a column to track how much storage (in bytes) each user has used

-- Check if column exists before adding it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('TS_Users') 
    AND name = 'storageUsed'
)
BEGIN
    ALTER TABLE TS_Users
    ADD storageUsed BIGINT NOT NULL DEFAULT 0;
    
    PRINT 'Column storageUsed added successfully to TS_Users table';
END
ELSE
BEGIN
    PRINT 'Column storageUsed already exists in TS_Users table';
END

-- Verify the column was added
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TS_Users'
AND COLUMN_NAME = 'storageUsed';
