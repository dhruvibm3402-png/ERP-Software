#!/bin/bash
# AURA ERP Scheduled Postgres Backup Script

set -e

# Configuration
BACKUP_DIR="/var/backups/aura_erp"
DATE=$(date +%Y%m%d_%H%M%S)
FILE_NAME="aura_db_backup_$DATE.sql.gz"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "Starting Database Backup -> $FILE_NAME"

# Dump and Zip DB dynamically linking the running production docker container
docker exec -t aura_erp_db pg_dump -U aura -d aura_erp -F p | gzip > "$BACKUP_DIR/$FILE_NAME"

echo "Backup local dump complete."

# Remove older files based on Retention logic
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -exec rm {} \;
echo "Cleaned up old local backups."

# Attempting AWS S3/Cloudflare R2 push (If AWS CLI is installed on VPS host)
if command -v aws &> /dev/null; then
    echo "Pushing Backup safely to encrypted Remote S3 Storage..."
    aws s3 cp "$BACKUP_DIR/$FILE_NAME" "s3://${AWS_BUCKET_NAME:-aura-erp-backups}/postgres/"
    echo "S3 Upload Complete."
else
    echo "AWS CLI not found. Local offline backup complete only."
fi
