-- Create super admin auth user with confirmed email
DO $$
DECLARE
  super_admin_id uuid;
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'mostafamoh4mmed@gmail.com' LIMIT 1;

  IF existing_id IS NULL THEN
    super_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      super_admin_id,
      'authenticated',
      'authenticated',
      'mostafamoh4mmed@gmail.com',
      crypt('SuperAdmin2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"super_admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      super_admin_id,
      jsonb_build_object('sub', super_admin_id::text, 'email', 'mostafamoh4mmed@gmail.com', 'email_verified', true),
      'email',
      super_admin_id::text,
      now(),
      now(),
      now()
    );
  ELSE
    -- Reset password and ensure confirmed
    UPDATE auth.users
      SET encrypted_password = crypt('SuperAdmin2026!', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = existing_id;
  END IF;
END $$;