UPDATE "SystemSetting"
SET value = 'true', type = 'boolean', updated_at = CURRENT_TIMESTAMP
WHERE key = 'email_verify' AND (value IS NULL OR value <> 'true');

UPDATE "SystemSetting"
SET value = '0', type = 'number', updated_at = CURRENT_TIMESTAMP
WHERE key = 'default_balance' AND (value IS NULL OR value <> '0');
