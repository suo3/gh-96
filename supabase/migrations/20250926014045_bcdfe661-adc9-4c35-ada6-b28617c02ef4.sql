-- Grant super admin privileges to the current user
INSERT INTO admin_users (user_id, role, granted_by, is_active) 
VALUES ('01560718-e407-4d6a-95be-05aef1c87cf0', 'super_admin', '01560718-e407-4d6a-95be-05aef1c87cf0', true) 
ON CONFLICT (user_id) DO UPDATE SET 
    role = 'super_admin', 
    is_active = true,
    granted_at = now();