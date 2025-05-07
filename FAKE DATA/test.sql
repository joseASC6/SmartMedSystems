
/* 

schedule table:
schedule_id (int)
staff_id (UUID)
date
time_rangez (List of TimeStamptz) format: [start_time, end_time, start_time, end_time]
is_weekly (bool)
day_of_week (text) format: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
slot_duration (int in minutes)

Generate time slots for a given schedule_id
Ex:
Schdule_ID = 193
time_rangez = ["2025-05-06 13:00:00+00","2025-05-06 21:00:00+00"] (9am to 5pm in UTC)
slot_duration = 60

Generate time slots:

9am to 10am
10am to 11am ...

time slots table:
time_slot_id (int auto generated)
schedule_id (UUID)
start_time (timestamptz)
end_time (timestamptz)
status (text) format: ['available', 'booked', 'unavailable']

TEST WITH the following data:
Schdule_ID = 193
time_rangez = ["2025-05-06 13:00:00+00","2025-05-06 21:00:00+00"] 
slot_duration = 60
*/ 
WITH RECURSIVE time_slots AS (
    SELECT
        schedule_id,
        generate_series(
            (time_rangez[1]::timestamptz - (slot_duration * interval '1 minute'))::timestamptz,
            time_rangez[2]::timestamptz,
            (slot_duration * interval '1 minute')::timestamptz
        ) AS start_time,
        (generate_series(
            (time_rangez[1]::timestamptz - (slot_duration * interval '1 minute'))::timestamptz,
            time_rangez[2]::timestamptz,
            (slot_duration * interval '1 minute')::timestamptz
        ) + (slot_duration * interval '1 minute')::timestamptz) AS end_time
    FROM schedule
    WHERE schedule_id = 193
)
SELECT
    schedule_id,
    start_time,
    end_time,
    'available' AS status
FROM time_slots
WHERE start_time < end_time
ORDER BY start_time;



