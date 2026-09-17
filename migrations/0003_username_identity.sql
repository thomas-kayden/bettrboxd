UPDATE users
SET display_name = username,
    updated_at = CURRENT_TIMESTAMP;
