CREATE SCHEMA public;

-- Create tables with updated structure
CREATE TABLE "public".permissions (
  permission_id integer NOT NULL,
  "scope" varchar(100) NOT NULL,
  "action" varchar(100) NOT NULL,
  CONSTRAINT pk_permissions PRIMARY KEY (permission_id)
);

CREATE TABLE "public".roles (
  role_id integer NOT NULL,
  parent_role_id integer,
  role_name varchar(50) NOT NULL,
  description varchar,
  CONSTRAINT pk_role PRIMARY KEY (role_id)
);

CREATE TABLE "public".threads (
  thread_id integer NOT NULL,
  subject varchar NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp,
  CONSTRAINT pk_threads PRIMARY KEY (thread_id)
);

CREATE TABLE "public".users (
  user_id uuid NOT NULL,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  email varchar NOT NULL,
  phone_number text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp NOT NULL,
  CONSTRAINT pk_user PRIMARY KEY (user_id)
);

CREATE TABLE "public".audit_logs (
  log_id integer NOT NULL,
  user_id uuid,
  "action" varchar(100) NOT NULL,
  "timestamp" timestamp NOT NULL,
  details varchar,
  CONSTRAINT pk_audit_log PRIMARY KEY (log_id)
);

CREATE INDEX idx_audit_logs_user_id ON "public".audit_logs (user_id);

CREATE TABLE "public".messages (
  message_id integer NOT NULL,
  thread_id integer NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  sent_at timestamp NOT NULL,
  CONSTRAINT pk_messages PRIMARY KEY (message_id)
);

CREATE INDEX idx_messages_thread_id ON "public".messages (thread_id);

CREATE TABLE "public".participants (
  participant_id integer NOT NULL,
  thread_id integer NOT NULL,
  user_id uuid NOT NULL,
  updated_at timestamp,
  CONSTRAINT pk_participants PRIMARY KEY (participant_id)
);

CREATE INDEX idx_participants_thread_id ON "public".participants (thread_id);
CREATE INDEX idx_participants_user_id ON "public".participants (user_id);

CREATE TABLE "public".role_permissions (
  role_id integer NOT NULL,
  permission_id integer NOT NULL,
  created_at timestamp NOT NULL,
  last_updated timestamp,
  CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE "public".user_permissions (
  user_id uuid NOT NULL,
  permission_id integer NOT NULL,
  is_allowed boolean NOT NULL,
  is_denied boolean NOT NULL,
  CONSTRAINT pk_user_permissions PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE "public".user_role (
  role_id integer NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp NOT NULL,
  last_updated timestamp,
  CONSTRAINT pk_user_role PRIMARY KEY (role_id, user_id)
);

CREATE TABLE "public".appointments (
  appointment_id integer NOT NULL,
  patient_id uuid NOT NULL,
  staff_id uuid NOT NULL,
  time_slot_id integer NOT NULL,
  status varchar(15),
  CONSTRAINT pk_appointments PRIMARY KEY (appointment_id),
  CONSTRAINT unq_appointment UNIQUE (time_slot_id)
);

CREATE INDEX idx_appointments_patient_id ON "public".appointments (patient_id);
CREATE INDEX idx_appointments_staff_id ON "public".appointments (staff_id);

CREATE TABLE "public".departments (
  department_id integer NOT NULL,
  name varchar(100) NOT NULL,
  head_of_department uuid,
  CONSTRAINT pk_department PRIMARY KEY (department_id)
);

CREATE TABLE "public".patients (
  patient_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  primary_provider_id uuid,
  date_of_birth date NOT NULL,
  gender varchar NOT NULL,
  blood_type varchar NOT NULL,
  insurance_provider varchar
);

CREATE TABLE "public".schedules (
  schedule_id integer NOT NULL,
  staff_id uuid NOT NULL,
  start_time timestamp NOT NULL,
  end_time timestamp NOT NULL,
  CONSTRAINT pk_schedule PRIMARY KEY (schedule_id)
);

CREATE TABLE "public".staff (
  staff_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  department_id integer,
  specialization varchar,
  hire_date date
);

CREATE INDEX idx_staff_department_id ON "public".staff (department_id);

CREATE TABLE "public".time_slots (
  time_slot_id integer NOT NULL,
  schedule_id integer NOT NULL,
  start_time timestamp NOT NULL,
  end_time timestamp NOT NULL,
  status varchar,
  CONSTRAINT pk_time_slot PRIMARY KEY (time_slot_id)
);

ALTER TABLE "public".time_slots ADD CONSTRAINT chk_valid_timespan CHECK (end_time > start_time);
CREATE INDEX idx_time_slots_schedule_id ON "public".time_slots (schedule_id);

-- Add foreign key constraints
ALTER TABLE "public".appointments ADD CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES "public".patients(patient_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".appointments ADD CONSTRAINT fk_appointment_staff FOREIGN KEY (staff_id) REFERENCES "public".staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".appointments ADD CONSTRAINT fk_appointment_time_slot FOREIGN KEY (time_slot_id) REFERENCES "public".time_slots(time_slot_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".audit_logs ADD CONSTRAINT fk_audit_log_users FOREIGN KEY (user_id) REFERENCES "public".users(user_id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public".departments ADD CONSTRAINT fk_departments_staff FOREIGN KEY (head_of_department) REFERENCES "public".staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".messages ADD CONSTRAINT fk_messages_threads FOREIGN KEY (thread_id) REFERENCES "public".threads(thread_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".messages ADD CONSTRAINT fk_messages_users FOREIGN KEY (user_id) REFERENCES "public".users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".participants ADD CONSTRAINT fk_participant_threads FOREIGN KEY (thread_id) REFERENCES "public".threads(thread_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".participants ADD CONSTRAINT fk_participant_user FOREIGN KEY (user_id) REFERENCES "public".users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".patients ADD CONSTRAINT fk_patient_users FOREIGN KEY (user_id) REFERENCES "public".users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".patients ADD CONSTRAINT fk_patient_staff FOREIGN KEY (primary_provider_id) REFERENCES "public".staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".role_permissions ADD CONSTRAINT fk_role_permissions_roles FOREIGN KEY (role_id) REFERENCES "public".roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".role_permissions ADD CONSTRAINT fk_role_permissions_permissions FOREIGN KEY (permission_id) REFERENCES "public".permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".roles ADD CONSTRAINT fk_roles_roles FOREIGN KEY (parent_role_id) REFERENCES "public".roles(role_id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public".schedules ADD CONSTRAINT fk_schedule_staff FOREIGN KEY (staff_id) REFERENCES "public".staff(staff_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".staff ADD CONSTRAINT fk_staff_department FOREIGN KEY (department_id) REFERENCES "public".departments(department_id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public".staff ADD CONSTRAINT fk_staff_users FOREIGN KEY (user_id) REFERENCES "public".users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".time_slots ADD CONSTRAINT fk_time_slot_schedule FOREIGN KEY (schedule_id) REFERENCES "public".schedules(schedule_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".user_permissions ADD CONSTRAINT fk_user_permissions_permissions FOREIGN KEY (permission_id) REFERENCES "public".permissions(permission_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".user_permissions ADD CONSTRAINT fk_user_permissions_users FOREIGN KEY (user_id) REFERENCES "public".users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".user_role ADD CONSTRAINT fk_user_role_users FOREIGN KEY (user_id) REFERENCES "public".users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public".user_role ADD CONSTRAINT fk_user_role_roles FOREIGN KEY (role_id) REFERENCES "public".roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public".permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".users ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public".time_slots ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow signup"
ON "public".users
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Users can insert own data"
ON "public".users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own data"
ON "public".users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Staff can read patient data"
ON "public".patients
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM "public".staff WHERE user_id = auth.uid()
));

CREATE POLICY "Patients can read own data"
ON "public".patients
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can read appointments"
ON "public".appointments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public".staff 
    WHERE user_id = auth.uid() 
    AND staff_id = appointments.staff_id
  )
);

CREATE POLICY "Patients can read own appointments"
ON "public".appointments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public".patients 
    WHERE user_id = auth.uid() 
    AND patient_id = appointments.patient_id
  )
);

CREATE POLICY "Users can read own messages"
ON "public".messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public".participants 
    WHERE user_id = auth.uid() 
    AND thread_id = messages.thread_id
  )
);

CREATE POLICY "Users can send messages"
ON "public".messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public".participants 
    WHERE user_id = auth.uid() 
    AND thread_id = messages.thread_id
  )
);

-- Add comments
COMMENT ON COLUMN "public".users.password_hash IS 'Securely hashed password';