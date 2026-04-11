-- Set up row level security
-- NOTE: We will use a custom function/JWT for auth later, for now we will disable it or use public.

-- Create users table
CREATE TABLE users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text unique not null,
  otp_verified boolean default false,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create events table
CREATE TABLE events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  title text not null,
  date date not null,
  time time not null,
  city text not null,
  district text not null,
  location_url text,
  payment_status text default 'unpaid',
  card_template_id text,
  card_image_url text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create guests table
CREATE TABLE guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  phone text not null,
  gender text not null,
  companions_count integer default 0,
  rsvp_status text default 'pending',
  qr_code_url text,
  attended boolean default false,
  arrival_time timestamp with time zone,
  invitation_sent_at timestamp with time zone
);

-- Create templates table
CREATE TABLE templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null, -- 'invitation' or 'qr'
  preview_image_url text,
  fields_config jsonb,
  qr_config jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create support_tickets table
CREATE TABLE support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  message text not null,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create media_attachments table
CREATE TABLE media_attachments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  type text not null, -- 'image' or 'youtube'
  url text not null,
  sent_to_attendees boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_attachments ENABLE ROW LEVEL SECURITY;

-- Note: Policies will be created separately depending on the Auth strategy (e.g. custom JWT)
