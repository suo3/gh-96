-- Activate the admin account for the current user
UPDATE admin_users 
SET is_active = true 
WHERE user_id = '01560718-e407-4d6a-95be-05aef1c87cf0' AND role = 'super_admin';