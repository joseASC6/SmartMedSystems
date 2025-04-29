CREATE SCHEMA IF NOT EXISTS "smart_med";

CREATE  TABLE "smart_med".permissions ( 
	permission_id        integer  NOT NULL  ,
	"scope"              varchar(100)  NOT NULL  ,
	"action"             varchar(100)  NOT NULL  ,
	CONSTRAINT pk_permissions PRIMARY KEY ( permission_id )
 );

CREATE  TABLE "smart_med".roles ( 
	role_id              integer  NOT NULL  ,
	parent_role_id       integer    ,
	role_name            varchar(50)  NOT NULL  ,
	description          varchar    ,
	CONSTRAINT pk_role PRIMARY KEY ( role_id )
 );

CREATE  TABLE "smart_med".threads ( 
	thread_id            integer  NOT NULL  ,
	subject              varchar  NOT NULL  ,
	created_at           timestamp  NOT NULL  ,
	updated_at           timestamp    ,
	CONSTRAINT pk_threads PRIMARY KEY ( thread_id )
 );

CREATE  TABLE "smart_med".users ( 
	user_id              integer  NOT NULL  ,
	first_name           varchar(50)  NOT NULL  ,
	last_name            varchar(50)  NOT NULL  ,
	email                varchar  NOT NULL  ,
	phone_number         text  NOT NULL  ,
	password_hash        text  NOT NULL  ,
	created_at           timestamp  NOT NULL  ,
	CONSTRAINT pk_user PRIMARY KEY ( user_id )
 );

CREATE  TABLE "smart_med".audit_logs ( 
	log_id               integer  NOT NULL  ,
	user_id              integer    ,
	"action"             varchar(100)  NOT NULL  ,
	"timestamp"          timestamp  NOT NULL  ,
	details              varchar    ,
	CONSTRAINT pk_audit_log PRIMARY KEY ( log_id )
 );

CREATE INDEX idx_audit_logs_user_id ON "smart_med".audit_logs  ( user_id );

CREATE  TABLE "smart_med".messages ( 
	message_id           integer  NOT NULL  ,
	thread_id            integer  NOT NULL  ,
	user_id              integer  NOT NULL  ,
	content              text  NOT NULL  ,
	sent_at              timestamp  NOT NULL  ,
	CONSTRAINT pk_messages PRIMARY KEY ( message_id )
 );

CREATE INDEX idx_messages_thread_id ON "smart_med".messages  ( thread_id );

CREATE  TABLE "smart_med".participants ( 
	participant_id       integer  NOT NULL  ,
	thread_id            integer  NOT NULL  ,
	user_id              integer  NOT NULL  ,
	updated_at           timestamp    ,
	CONSTRAINT pk_participants PRIMARY KEY ( participant_id )
 );

CREATE INDEX idx_participants_thread_id ON "smart_med".participants  ( thread_id );

CREATE INDEX idx_participants_user_id ON "smart_med".participants  ( user_id );

CREATE  TABLE "smart_med".role_permissions ( 
	role_id              integer  NOT NULL  ,
	permission_id        integer  NOT NULL  ,
	created_at           timestamp  NOT NULL  ,
	last_updated         timestamp    ,
	CONSTRAINT pk_role_permissions PRIMARY KEY ( role_id, permission_id )
 );

CREATE  TABLE "smart_med".user_permissions ( 
	user_id              integer  NOT NULL  ,
	permission_id        integer  NOT NULL  ,
	is_allowed           boolean  NOT NULL  ,
	is_denied            boolean  NOT NULL  ,
	CONSTRAINT pk_user_permissions PRIMARY KEY ( user_id, permission_id )
 );

CREATE  TABLE "smart_med".user_role ( 
	role_id              integer  NOT NULL  ,
	user_id              integer  NOT NULL  ,
	created_at           timestamp  NOT NULL  ,
	last_updated         timestamp    ,
	CONSTRAINT pk_user_role PRIMARY KEY ( role_id, user_id )
 );

CREATE  TABLE "smart_med".appointments ( 
	appointment_id       integer  NOT NULL  ,
	patient_id           integer  NOT NULL  ,
	staff_id             integer  NOT NULL  ,
	time_slot_id         integer  NOT NULL  ,
	status               varchar(15)    ,
	CONSTRAINT pk_appointments PRIMARY KEY ( appointment_id ),
	CONSTRAINT unq_appointment UNIQUE ( time_slot_id ) 
 );

CREATE INDEX idx_appointments_patient_id ON "smart_med".appointments  ( patient_id );

CREATE INDEX idx_appointments_staff_id ON "smart_med".appointments  ( staff_id );

CREATE  TABLE "smart_med".departments ( 
	department_id        integer  NOT NULL  ,
	name                 varchar(100)  NOT NULL  ,
	head_of_department   integer    ,
	CONSTRAINT pk_department PRIMARY KEY ( department_id )
 );

CREATE  TABLE "smart_med".patients ( 
	patient_id           integer  NOT NULL  ,
	user_id              integer    ,
	primary_provider_id  integer  NOT NULL  ,
	date_of_birth        date  NOT NULL  ,
	gender               varchar  NOT NULL  ,
	blood_type           varchar  NOT NULL  ,
	insurance_provider   varchar    ,
	CONSTRAINT pk_patient PRIMARY KEY ( patient_id )
 );

CREATE  TABLE "smart_med".schedules ( 
	schedule_id          integer  NOT NULL  ,
	staff_id             integer  NOT NULL  ,
	start_time           timestamp  NOT NULL  ,
	end_time             timestamp  NOT NULL  ,
	CONSTRAINT pk_schedule PRIMARY KEY ( schedule_id )
 );

CREATE  TABLE "smart_med".staff ( 
	staff_id             integer  NOT NULL  ,
	user_id              integer  NOT NULL  ,
	department_id        integer    ,
	specialization       varchar    ,
	hire_date            date    ,
	CONSTRAINT pk_employee PRIMARY KEY ( staff_id )
 );

CREATE INDEX idx_staff_department_id ON "smart_med".staff  ( department_id );

CREATE  TABLE "smart_med".time_slots ( 
	time_slot_id         integer  NOT NULL  ,
	schedule_id          integer  NOT NULL  ,
	start_time           timestamp  NOT NULL  ,
	end_time             timestamp  NOT NULL  ,
	status               varchar    ,
	CONSTRAINT pk_time_slot PRIMARY KEY ( time_slot_id )
 );

ALTER TABLE "smart_med".time_slots ADD CONSTRAINT chk_valid_timespan CHECK ( end_time > start_time );

CREATE INDEX idx_time_slots_schedule_id ON "smart_med".time_slots  ( schedule_id );

ALTER TABLE "smart_med".appointments ADD CONSTRAINT fk_appointment_patient FOREIGN KEY ( patient_id ) REFERENCES "smart_med".patients( patient_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".appointments ADD CONSTRAINT fk_appointment_staff FOREIGN KEY ( staff_id ) REFERENCES "smart_med".staff( staff_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".appointments ADD CONSTRAINT fk_appointment_time_slot FOREIGN KEY ( time_slot_id ) REFERENCES "smart_med".time_slots( time_slot_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".audit_logs ADD CONSTRAINT fk_audit_log_users FOREIGN KEY ( user_id ) REFERENCES "smart_med".users( user_id ) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "smart_med".departments ADD CONSTRAINT fk_departments_staff FOREIGN KEY ( head_of_department ) REFERENCES "smart_med".staff( staff_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".messages ADD CONSTRAINT fk_messages_threads FOREIGN KEY ( thread_id ) REFERENCES "smart_med".threads( thread_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".messages ADD CONSTRAINT fk_messages_users FOREIGN KEY ( user_id ) REFERENCES "smart_med".users( user_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".participants ADD CONSTRAINT fk_participant_threads FOREIGN KEY ( thread_id ) REFERENCES "smart_med".threads( thread_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".participants ADD CONSTRAINT fk_participant_user FOREIGN KEY ( user_id ) REFERENCES "smart_med".users( user_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".patients ADD CONSTRAINT fk_patient_users FOREIGN KEY ( user_id ) REFERENCES "smart_med".users( user_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".patients ADD CONSTRAINT fk_patient_staff FOREIGN KEY ( primary_provider_id ) REFERENCES "smart_med".staff( staff_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".role_permissions ADD CONSTRAINT fk_role_permissions_roles FOREIGN KEY ( role_id ) REFERENCES "smart_med".roles( role_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".role_permissions ADD CONSTRAINT fk_role_permissions_permissions FOREIGN KEY ( permission_id ) REFERENCES "smart_med".permissions( permission_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".roles ADD CONSTRAINT fk_roles_roles FOREIGN KEY ( parent_role_id ) REFERENCES "smart_med".roles( role_id ) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "smart_med".schedules ADD CONSTRAINT fk_schedule_staff FOREIGN KEY ( staff_id ) REFERENCES "smart_med".staff( staff_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".staff ADD CONSTRAINT fk_staff_department FOREIGN KEY ( department_id ) REFERENCES "smart_med".departments( department_id ) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "smart_med".staff ADD CONSTRAINT fk_staff_users FOREIGN KEY ( user_id ) REFERENCES "smart_med".users( user_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".time_slots ADD CONSTRAINT fk_time_slot_schedule FOREIGN KEY ( schedule_id ) REFERENCES "smart_med".schedules( schedule_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".user_permissions ADD CONSTRAINT fk_user_permissions_permissions FOREIGN KEY ( permission_id ) REFERENCES "smart_med".permissions( permission_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".user_permissions ADD CONSTRAINT fk_user_permissions_users FOREIGN KEY ( user_id ) REFERENCES "smart_med".users( user_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".user_role ADD CONSTRAINT fk_user_role_users FOREIGN KEY ( user_id ) REFERENCES "smart_med".users( user_id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "smart_med".user_role ADD CONSTRAINT fk_user_role_roles FOREIGN KEY ( role_id ) REFERENCES "smart_med".roles( role_id ) ON DELETE CASCADE ON UPDATE CASCADE;

COMMENT ON COLUMN "smart_med".users.password_hash IS 'Securely hashed password';

