CREATE TABLE IF NOT EXISTS muscle_group (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  UNIQUE (name)
);

CREATE TYPE execution_type AS ENUM ('repetition', 'distance', 'time');
CREATE TYPE duration_unit AS ENUM ('seconds', 'minutes', 'hours');
CREATE TYPE distance_unit AS ENUM ('feet', 'yards', 'miles', 'km');
CREATE TYPE exercise_weight_unit AS ENUM ('lbs', 'kg');
CREATE TYPE body_composition_measurement_type AS ENUM ('length', 'weight', 'percentage');
CREATE TYPE body_composition_length_unit AS ENUM ('inches', 'cm');
CREATE TYPE body_composition_weight_unit AS ENUM ('lbs', 'kg');

INSERT INTO muscle_group (id, name)
OVERRIDING SYSTEM VALUE
SELECT seed.id, seed.name
FROM (
  VALUES
    (1, 'chest'),
    (2, 'shoulders'),
    (3, 'biceps'),
    (4, 'triceps'),
    (5, 'quadriceps'),
    (6, 'hamstrings'),
    (7, 'calves'),
    (8, 'lats'),
    (9, 'back'),
    (10, 'cardio')
) AS seed(id, name)
WHERE NOT EXISTS (
  SELECT 1
  FROM muscle_group mg
  WHERE mg.name = seed.name
);

CREATE TABLE IF NOT EXISTS exercises (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  muscle_groups INT[] NOT NULL,
  is_compound BOOL,
  is_bodyweight BOOL,
  execution_type execution_type NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups_gin
  ON exercises
  USING GIN (muscle_groups);

-- ================================================================================
-- Workout Templates
-- ================================================================================

CREATE TABLE IF NOT EXISTS workout_template (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS workout_template_segment (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_template_id INT NOT NULL REFERENCES workout_template(id) ON DELETE CASCADE,
  segment_order INT NOT NULL CHECK (segment_order > 0),
  sets INT NOT NULL CHECK (sets > 0)
);
CREATE INDEX IF NOT EXISTS idx_workout_template_segment_template_id_segment_order
  ON workout_template_segment (workout_template_id, segment_order);

CREATE TABLE IF NOT EXISTS workout_template_segment_exercise (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_template_segment_id INT NOT NULL REFERENCES workout_template_segment(id) ON DELETE CASCADE,
  exercise_order INT NOT NULL CHECK (exercise_order > 0),
  exercise_id INT NOT NULL REFERENCES exercises(id),
  execution_type execution_type,
  exercise_weight_unit exercise_weight_unit,
  duration_unit duration_unit,
  distance_unit distance_unit
);
CREATE INDEX IF NOT EXISTS idx_workout_template_segment_exercise_segment_id_exercise_order
  ON workout_template_segment_exercise (workout_template_segment_id, exercise_order);

CREATE TABLE IF NOT EXISTS workout_template_segment_exercise_measurement (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_template_segment_exercise_id INT NOT NULL REFERENCES workout_template_segment_exercise(id) ON DELETE CASCADE,
  set_order INT NOT NULL CHECK (set_order > 0),
  reps INT,
  reps_to_failure BOOL,
  weight_used NUMERIC(8, 2),
  duration NUMERIC(8, 2),
  distance NUMERIC(8, 2)
);

-- ================================================================================
-- Workouts
-- ================================================================================

CREATE TABLE IF NOT EXISTS workout (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  workout_date DATE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workout_workout_date
  ON workout (workout_date);

CREATE TABLE IF NOT EXISTS workout_segment (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_id INT NOT NULL REFERENCES workout(id) ON DELETE CASCADE,
  segment_order INT NOT NULL CHECK (segment_order > 0),
  sets INT NOT NULL CHECK (sets > 0)
);
CREATE INDEX IF NOT EXISTS idx_workout_segment_workout_id_segment_order
  ON workout_segment (workout_id, segment_order);

CREATE TABLE IF NOT EXISTS workout_segment_exercise (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_segment_id INT NOT NULL REFERENCES workout_segment(id) ON DELETE CASCADE,
  exercise_order INT NOT NULL CHECK (exercise_order > 0),
  exercise_id INT NOT NULL REFERENCES exercises(id),
  execution_type execution_type,
  exercise_weight_unit exercise_weight_unit,
  duration_unit duration_unit,
  distance_unit distance_unit
);
CREATE INDEX IF NOT EXISTS idx_workout_segment_exercise_segment_id_exercise_order
  ON workout_segment_exercise (workout_segment_id, exercise_order);

CREATE TABLE IF NOT EXISTS workout_segment_exercise_measurement (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_segment_exercise_id INT NOT NULL REFERENCES workout_segment_exercise(id) ON DELETE CASCADE,
  set_order INT NOT NULL CHECK (set_order > 0),
  reps INT,
  reps_to_failure BOOL,
  weight_used NUMERIC(8, 2),
  duration NUMERIC(8, 2),
  distance NUMERIC(8, 2)
);
CREATE INDEX IF NOT EXISTS idx_workout_segment_exercise_measurement_exercise_id_set_order
  ON workout_segment_exercise_measurement (workout_segment_exercise_id, set_order);



-- ================================================================================
-- Body Composition
-- ================================================================================

CREATE TABLE IF NOT EXISTS body_composition_metric (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  measurement_type body_composition_measurement_type NOT NULL
);

CREATE TABLE IF NOT EXISTS body_composition_measurement (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  body_composition_metric_id INT NOT NULL REFERENCES body_composition_metric(id),
  measurement_date TIMESTAMP NOT NULL,
  value NUMERIC(8, 2) NOT NULL,
  length_unit body_composition_length_unit,
  weight_unit body_composition_weight_unit
);

-- ================================================================================
-- Logging
-- ================================================================================

CREATE TABLE IF NOT EXISTS network_timing_log (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_start TIMESTAMPTZ,
  client_end TIMESTAMPTZ,
  server_start TIMESTAMPTZ,
  server_end TIMESTAMPTZ,
  operation VARCHAR(150) NOT NULL,
  trace_id VARCHAR(150),
  CHECK (client_end IS NULL OR client_start IS NULL OR client_end >= client_start),
  CHECK (server_end IS NULL OR server_start IS NULL OR server_end >= server_start)
);
CREATE INDEX IF NOT EXISTS idx_network_timing_log_trace_id
  ON network_timing_log (trace_id);
CREATE INDEX IF NOT EXISTS idx_network_timing_log_operation
  ON network_timing_log (operation);
CREATE INDEX IF NOT EXISTS idx_network_timing_log_server_start
  ON network_timing_log (server_start);
CREATE INDEX IF NOT EXISTS idx_network_timing_log_client_start
  ON network_timing_log (client_start);


-- ================================================================================
-- Data
-- ================================================================================

WITH exercise_seed AS (
  SELECT *
  FROM (
    VALUES
      (1, 'Bench Press', 'Lie on a flat bench, lower the bar to your chest, then press it back up with control.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (2, 'Incline Dumbbell Press', 'Set the bench to an incline and press dumbbells from chest level to full extension overhead of your chest.', ARRAY['chest', 'shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (3, 'Decline Bench Press', 'Use a decline bench, lower the bar to the lower chest, and press to lockout.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (4, 'Push-Up', 'Start in a plank, lower your chest toward the floor, and push back to straight arms.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (5, 'Dumbbell Fly', 'With a slight elbow bend, open your arms wide and bring the dumbbells together over your chest.', ARRAY['chest', 'shoulders'], false, 'repetition', NULL, NULL),
      (6, 'Cable Fly', 'Set cables at chest height, step forward, and sweep your hands together in front of your chest.', ARRAY['chest', 'shoulders'], false, 'repetition', NULL, NULL),
      (7, 'Chest Dips', 'Lean slightly forward on dip bars, lower your body, and press back up.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (8, 'Machine Chest Press', 'Sit with handles at chest level and press forward until arms are extended, then return slowly.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (9, 'Pec Deck', 'Sit with elbows on pads and bring arms inward until they meet, then return under control.', ARRAY['chest'], false, 'repetition', NULL, NULL),
      (10, 'Dumbell Bench Press', 'Lie on a flat bench, lower dumbbells to chest level, then press them back up with control.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),

      (11, 'Back Squat', 'Place a bar on your upper back, sit down until thighs are at least parallel, then stand up.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (12, 'Front Squat', 'Rack the bar on your shoulders, keep your torso upright, squat down, and drive back up.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (13, 'Goblet Squat', 'Hold a dumbbell at your chest, squat deep with an upright torso, then stand.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (14, 'Bulgarian Split Squat', 'Place rear foot on a bench, lower into a split squat, and press through the front foot.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (15, 'Leg Press', 'Place feet on the platform, lower the sled until knees bend deeply, and press it away.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (16, 'Walking Lunge', 'Step forward into a lunge, push through the front leg, and continue stepping.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (17, 'Step-Up', 'Step onto a box with one leg, drive up, then lower back down with control.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (18, 'Leg Extension', 'Sit in the machine and extend your knees until legs are straight, then lower slowly.', ARRAY['quadriceps'], false, 'repetition', NULL, NULL),
      (19, 'Hack Squat', 'Set your back against the pad, squat down under control, and drive up through your feet.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (20, 'Pistol Squat', 'Balance on one leg, squat down as low as possible, then stand back up.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),

      (21, 'Romanian Deadlift', 'Hold the bar close, hinge at the hips with soft knees, then stand by driving hips forward.', ARRAY['hamstrings', 'back'], true, 'repetition', NULL, NULL),
      (22, 'Conventional Deadlift', 'Pull the bar from the floor by pushing through the legs and extending your hips and knees.', ARRAY['hamstrings', 'back', 'lats'], true, 'repetition', NULL, NULL),
      (23, 'Sumo Deadlift', 'Take a wide stance, grip inside your knees, and stand up with the bar in a straight path.', ARRAY['hamstrings', 'back', 'quadriceps'], true, 'repetition', NULL, NULL),
      (24, 'Good Morning', 'Place a bar on your back, hinge forward at the hips, and return to standing.', ARRAY['hamstrings', 'back'], true, 'repetition', NULL, NULL),
      (25, 'Hip Thrust', 'Rest upper back on a bench, drive hips up with feet planted, and squeeze at the top.', ARRAY['hamstrings'], true, 'repetition', NULL, NULL),
      (26, 'Glute Bridge', 'Lie on your back with knees bent, lift hips up, then lower under control.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (27, 'Lying Leg Curl', 'Lie face down on the machine and curl your heels toward your hips.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (28, 'Seated Leg Curl', 'Sit in the machine, pull the pad down with your legs, then return slowly.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (29, 'Nordic Hamstring Curl', 'Anchor your feet, lower your body forward slowly, and pull back up.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (30, 'Single-Leg Romanian Deadlift', 'Balance on one leg, hinge forward while extending the other leg back, then stand.', ARRAY['hamstrings', 'back'], true, 'repetition', NULL, NULL),

      (31, 'Standing Calf Raise', 'Raise your heels as high as possible, pause at the top, and lower fully.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (32, 'Seated Calf Raise', 'Sit with weight on knees and lift your heels up, then lower with control.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (33, 'Donkey Calf Raise', 'Hinge at the hips and perform heel raises through a full range of motion.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (34, 'Single-Leg Calf Raise', 'Stand on one foot, raise your heel up, and lower below step level if possible.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (35, 'Calf Press on Leg Press', 'Use the leg press platform and press through the balls of your feet only.', ARRAY['calves'], false, 'repetition', NULL, NULL),

      (36, 'Overhead Press', 'Press a bar or dumbbells from shoulder height to overhead while keeping your core tight.', ARRAY['shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (37, 'Seated Dumbbell Shoulder Press', 'Press dumbbells overhead from shoulder level while seated upright.', ARRAY['shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (38, 'Arnold Press', 'Start palms facing you, rotate as you press overhead, then reverse on the way down.', ARRAY['shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (39, 'Lateral Raise', 'Lift dumbbells out to the sides until shoulder height, then lower slowly.', ARRAY['shoulders'], false, 'repetition', NULL, NULL),
      (40, 'Front Raise', 'Raise a dumbbell or plate in front of you to shoulder height, then lower.', ARRAY['shoulders'], false, 'repetition', NULL, NULL),
      (41, 'Rear Delt Fly', 'Hinge forward and open your arms out wide to target the rear shoulders.', ARRAY['shoulders'], false, 'repetition', NULL, NULL),
      (42, 'Face Pull', 'Pull a rope attachment toward your face with elbows high, then return under control.', ARRAY['shoulders', 'back'], false, 'repetition', NULL, NULL),
      (43, 'Upright Row', 'Pull a bar or dumbbells upward close to your body to upper chest height.', ARRAY['shoulders', 'lats'], false, 'repetition', NULL, NULL),
      (44, 'Push Press', 'Dip slightly at the knees and drive the bar overhead using leg momentum.', ARRAY['shoulders', 'triceps', 'quadriceps'], true, 'repetition', NULL, NULL),
      (45, 'Landmine Press', 'Press the bar upward and forward from shoulder level in an arc.', ARRAY['shoulders', 'chest', 'triceps'], true, 'repetition', NULL, NULL),

      (46, 'Pull-Up', 'Hang from a bar, pull your chest toward it, and lower until arms are straight.', ARRAY['lats', 'biceps', 'back'], true, 'repetition', NULL, NULL),
      (47, 'Chin-Up', 'Use a supinated grip, pull up until your chin clears the bar, then lower.', ARRAY['lats', 'biceps', 'back'], true, 'repetition', NULL, NULL),
      (48, 'Lat Pulldown', 'Pull the bar down toward your upper chest and control it back up.', ARRAY['lats', 'biceps'], true, 'repetition', NULL, NULL),
      (49, 'Bent-Over Barbell Row', 'Hinge at the hips, row the bar to your torso, and lower with control.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (50, 'Single-Arm Dumbbell Row', 'Support one hand on a bench and row the dumbbell toward your hip.', ARRAY['lats', 'back', 'biceps'], true, 'repetition', NULL, NULL),
      (51, 'Seated Cable Row', 'Pull the handle toward your torso while keeping your chest up.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (52, 'T-Bar Row', 'Hinge and row the loaded bar toward your midsection, then lower slowly.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (53, 'Chest-Supported Row', 'Lie chest-down on a bench and row weights up without swinging.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (54, 'Inverted Row', 'Hang under a bar, pull your chest to the bar, and lower under control.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (55, 'Straight-Arm Pulldown', 'With straight arms, pull the cable down to your thighs using your lats.', ARRAY['lats'], false, 'repetition', NULL, NULL),

      (56, 'Barbell Curl', 'Curl the bar upward without swinging, squeeze at the top, and lower slowly.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (57, 'Dumbbell Curl', 'Curl dumbbells up with elbows by your sides, then lower with control.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (58, 'Hammer Curl', 'Keep neutral grips and curl dumbbells up while keeping elbows tucked.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (59, 'Preacher Curl', 'Brace your arms on the pad and curl the weight up through full range.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (60, 'Concentration Curl', 'Sit and curl one dumbbell with your elbow braced on your thigh.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (61, 'Cable Curl', 'Curl a cable handle upward with constant tension and control on the way down.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (62, 'Reverse Curl', 'Use an overhand grip and curl the bar up while keeping wrists neutral.', ARRAY['biceps'], false, 'repetition', NULL, NULL),

      (63, 'Close-Grip Bench Press', 'Use a narrower grip, lower the bar to your chest, and press up.', ARRAY['triceps', 'chest'], true, 'repetition', NULL, NULL),
      (64, 'Triceps Dip', 'Keep torso upright, lower on dip bars, and press back up mainly with triceps.', ARRAY['triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (65, 'Skull Crusher', 'Lower an EZ bar toward your forehead by bending elbows, then extend back up.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (66, 'Overhead Triceps Extension', 'Raise a dumbbell or cable overhead and extend elbows to straighten arms.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (67, 'Cable Pushdown', 'Push the cable handle down by extending your elbows and return slowly.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (68, 'Rope Triceps Pushdown', 'Push the rope down and spread the ends apart at the bottom.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (69, 'Bench Dip', 'Place hands on a bench, lower your body, and press up to straight elbows.', ARRAY['triceps', 'shoulders'], false, 'repetition', NULL, NULL),
      (70, 'Kickback', 'Hinge forward, keep upper arm still, and extend your elbow to move the weight back.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (71, 'Running', 'Run at a sustainable pace over a measured distance.', ARRAY['cardio'], true, 'distance', 'miles', NULL),
      (72, 'Rowing', 'Row continuously with controlled strokes for a set duration.', ARRAY['back', 'lats', 'biceps'], true, 'time', NULL, 'minutes')
  ) AS seed(id, name, description, muscle_groups, is_compound, execution_type, seed_distance_unit, seed_duration_unit)
),
inserted_exercises AS (
  INSERT INTO exercises (id, name, description, muscle_groups, is_compound, is_bodyweight, execution_type)
  OVERRIDING SYSTEM VALUE
  SELECT
    seed.id,
    seed.name,
    seed.description,
    ARRAY(
      SELECT mg.id
      FROM unnest(seed.muscle_groups) WITH ORDINALITY AS seed_mg(muscle_group_name, ord)
      JOIN muscle_group mg ON mg.name = seed_mg.muscle_group_name
      ORDER BY seed_mg.ord
    )::INT[],
    seed.is_compound,
    CASE
      WHEN seed.name IN (
        'Push-Up',
        'Chest Dips',
        'Pistol Squat',
        'Glute Bridge',
        'Nordic Hamstring Curl',
        'Pull-Up',
        'Chin-Up',
        'Inverted Row',
        'Triceps Dip',
        'Bench Dip'
      ) THEN true
      ELSE false
    END AS is_bodyweight,
    seed.execution_type::execution_type
  FROM exercise_seed seed
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.name = seed.name
  )
  RETURNING id, name
)
SELECT 1;

INSERT INTO body_composition_metric (name, measurement_type)
SELECT seed.name, seed.measurement_type::body_composition_measurement_type
FROM (
  VALUES
    ('Waist', 'length'),
    ('Bodyweight', 'weight'),
    ('Bodyfat %', 'percentage')
) AS seed(name, measurement_type);

-- ================================================================================
-- Workout Template Data
-- ================================================================================


INSERT INTO workout_template (name, description)
VALUES
  ('Back Day', 'Back-focused day with a two-exercise opening compound set followed by focused back accessory work.'),
  ('Chest Day', 'Chest-focused day with a two-exercise opening compound set followed by chest isolation work.'),
  ('Arms Day', 'Biceps and triceps day with a two-exercise opening compound set and arm accessory work.'),
  ('Legs Day', 'Lower-body day with a two-exercise opening compound set followed by unilateral and machine work.'),
  ('Shoulders Day', 'Shoulder-focused day with a two-exercise opening compound set followed by delt accessory work.'),
  ('Push Day', 'Push-focused day for chest, shoulders, and triceps with a two-exercise opening set.'),
  ('Pull Day', 'Pull-focused day for back and biceps with a two-exercise opening set.'),
  ('Lower Body Day', 'Lower-body strength day with a two-exercise opening set followed by leg accessory work.');

INSERT INTO workout_template_segment (workout_template_id, segment_order, sets)
SELECT wt.id, seed.segment_order, seed.sets
FROM workout_template wt
JOIN (
  VALUES
    ('Back Day', 1, 5),
    ('Back Day', 2, 4),
    ('Back Day', 3, 3),
    ('Back Day', 4, 4),
    ('Back Day', 5, 3),

    ('Chest Day', 1, 4),
    ('Chest Day', 2, 4),
    ('Chest Day', 3, 3),
    ('Chest Day', 4, 4),
    ('Chest Day', 5, 3),

    ('Arms Day', 1, 4),
    ('Arms Day', 2, 3),
    ('Arms Day', 3, 3),
    ('Arms Day', 4, 4),
    ('Arms Day', 5, 3),

    ('Legs Day', 1, 5),
    ('Legs Day', 2, 4),
    ('Legs Day', 3, 4),
    ('Legs Day', 4, 3),
    ('Legs Day', 5, 4),

    ('Shoulders Day', 1, 4),
    ('Shoulders Day', 2, 3),
    ('Shoulders Day', 3, 3),
    ('Shoulders Day', 4, 4),
    ('Shoulders Day', 5, 3),

    ('Push Day', 1, 4),
    ('Push Day', 2, 4),
    ('Push Day', 3, 3),
    ('Push Day', 4, 3),
    ('Push Day', 5, 4),

    ('Pull Day', 1, 5),
    ('Pull Day', 2, 4),
    ('Pull Day', 3, 3),
    ('Pull Day', 4, 4),
    ('Pull Day', 5, 3),

    ('Lower Body Day', 1, 5),
    ('Lower Body Day', 2, 4),
    ('Lower Body Day', 3, 3),
    ('Lower Body Day', 4, 4),
    ('Lower Body Day', 5, 3)
) AS seed(template_name, segment_order, sets)
  ON seed.template_name = wt.name;

INSERT INTO workout_template_segment_exercise (
  workout_template_segment_id,
  exercise_order,
  exercise_id,
  execution_type,
  exercise_weight_unit
)
SELECT
  wts.id,
  seed.exercise_order,
  seed.exercise_id,
  ex.execution_type,
  CASE
    WHEN NOT ex.is_bodyweight AND ex.execution_type = 'repetition' THEN 'lbs'::exercise_weight_unit
    ELSE NULL
  END
FROM workout_template wt
JOIN workout_template_segment wts ON wts.workout_template_id = wt.id
JOIN (
  VALUES
    ('Back Day', 1, 1, 49),
    ('Back Day', 1, 2, 48),
    ('Back Day', 2, 1, 51),
    ('Back Day', 3, 1, 52),
    ('Back Day', 4, 1, 53),
    ('Back Day', 5, 1, 55),

    ('Chest Day', 1, 1, 1),
    ('Chest Day', 1, 2, 2),
    ('Chest Day', 2, 1, 8),
    ('Chest Day', 3, 1, 5),
    ('Chest Day', 4, 1, 6),
    ('Chest Day', 5, 1, 9),

    ('Arms Day', 1, 1, 56),
    ('Arms Day', 1, 2, 65),
    ('Arms Day', 2, 1, 57),
    ('Arms Day', 3, 1, 58),
    ('Arms Day', 4, 1, 67),
    ('Arms Day', 5, 1, 68),

    ('Legs Day', 1, 1, 11),
    ('Legs Day', 1, 2, 21),
    ('Legs Day', 2, 1, 15),
    ('Legs Day', 3, 1, 14),
    ('Legs Day', 4, 1, 18),
    ('Legs Day', 5, 1, 28),

    ('Shoulders Day', 1, 1, 36),
    ('Shoulders Day', 1, 2, 38),
    ('Shoulders Day', 2, 1, 37),
    ('Shoulders Day', 3, 1, 39),
    ('Shoulders Day', 4, 1, 40),
    ('Shoulders Day', 5, 1, 41),

    ('Push Day', 1, 1, 1),
    ('Push Day', 1, 2, 36),
    ('Push Day', 2, 1, 2),
    ('Push Day', 3, 1, 8),
    ('Push Day', 4, 1, 63),
    ('Push Day', 5, 1, 67),

    ('Pull Day', 1, 1, 49),
    ('Pull Day', 1, 2, 48),
    ('Pull Day', 2, 1, 50),
    ('Pull Day', 3, 1, 51),
    ('Pull Day', 4, 1, 56),
    ('Pull Day', 5, 1, 58),

    ('Lower Body Day', 1, 1, 12),
    ('Lower Body Day', 1, 2, 25),
    ('Lower Body Day', 2, 1, 13),
    ('Lower Body Day', 3, 1, 19),
    ('Lower Body Day', 4, 1, 27),
    ('Lower Body Day', 5, 1, 31)
) AS seed(template_name, segment_order, exercise_order, exercise_id)
  ON seed.template_name = wt.name
 AND seed.segment_order = wts.segment_order
JOIN exercises ex ON ex.id = seed.exercise_id
WHERE ex.execution_type = 'repetition';

INSERT INTO workout_template_segment_exercise_measurement (
  workout_template_segment_exercise_id,
  set_order,
  reps,
  reps_to_failure,
  weight_used
)
SELECT
  wtse.id,
  set_seed.set_order,
  8 + ((set_seed.set_order + wtse.exercise_id + wts.segment_order) % 5),
  false,
  CASE
    WHEN ex.is_compound THEN 135
    ELSE 55
  END
FROM workout_template wt
JOIN workout_template_segment wts ON wts.workout_template_id = wt.id
JOIN workout_template_segment_exercise wtse
  ON wtse.workout_template_segment_id = wts.id
JOIN exercises ex ON ex.id = wtse.exercise_id
JOIN LATERAL (
  SELECT gs::INT AS set_order
  FROM generate_series(1, wts.sets) AS gs
) AS set_seed ON true
WHERE wt.name IN (
  'Back Day',
  'Chest Day',
  'Arms Day',
  'Legs Day',
  'Shoulders Day',
  'Push Day',
  'Pull Day',
  'Lower Body Day'
)
  AND ex.execution_type = 'repetition';

-- ================================================================================
-- Workout Data
-- ================================================================================

INSERT INTO workout (id, name, description, workout_date)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Workout 10', '', CURRENT_DATE),
  (2, 'Workout 9', '', CURRENT_DATE - INTERVAL '1 day'),
  (3, 'Workout 8', '', CURRENT_DATE - INTERVAL '2 day'),
  (4, 'Workout 7', '', CURRENT_DATE - INTERVAL '3 day'),
  (5, 'Workout 6', '', CURRENT_DATE - INTERVAL '4 day'),
  (6, 'Workout 5', '', CURRENT_DATE - INTERVAL '5 day'),
  (7, 'Workout 4', '', CURRENT_DATE - INTERVAL '6 day'),
  (8, 'Workout 3', '', CURRENT_DATE - INTERVAL '7 day'),
  (9, 'Workout 2', '', CURRENT_DATE - INTERVAL '8 day'),
  (10, 'Workout 1', '', CURRENT_DATE - INTERVAL '9 day');

INSERT INTO workout_segment (workout_id, segment_order, sets)
SELECT w.id, seed.segment_order, 4
FROM workout w
JOIN (
  VALUES
    (1),
    (2)
) AS seed(segment_order) ON true;

INSERT INTO workout_segment_exercise (
  workout_segment_id,
  exercise_order,
  exercise_id,
  execution_type,
  exercise_weight_unit,
  duration_unit,
  distance_unit
)
SELECT
  ws.id,
  1,
  seed.exercise_id,
  ex.execution_type,
  CASE
    WHEN ex.execution_type = 'repetition' AND NOT ex.is_bodyweight THEN 'lbs'::exercise_weight_unit
    ELSE NULL
  END,
  CASE
    WHEN ex.execution_type = 'time' THEN 'minutes'::duration_unit
    ELSE NULL
  END,
  CASE
    WHEN ex.execution_type = 'distance' THEN 'miles'::distance_unit
    ELSE NULL
  END
FROM workout w
JOIN workout_segment ws ON ws.workout_id = w.id
JOIN (
  VALUES
    (1, 1, 2),
    (1, 2, 45),
    (2, 1, 11),
    (2, 2, 33),
    (3, 1, 6),
    (3, 2, 48),
    (4, 1, 19),
    (4, 2, 26),
    (5, 1, 9),
    (5, 2, 50),
    (6, 1, 14),
    (6, 2, 37),
    (7, 1, 8),
    (7, 2, 41),
    (8, 1, 5),
    (8, 2, 29),
    (9, 1, 16),
    (9, 2, 47),
    (10, 1, 3),
    (10, 2, 44)
) AS seed(workout_id, segment_order, exercise_id)
  ON seed.workout_id = w.id
 AND seed.segment_order = ws.segment_order
JOIN exercises ex ON ex.id = seed.exercise_id;

INSERT INTO workout_segment_exercise_measurement (
  workout_segment_exercise_id,
  set_order,
  reps,
  reps_to_failure,
  weight_used,
  duration,
  distance
)
SELECT
  wse.id,
  set_seed.set_order,
  CASE
    WHEN ex.execution_type = 'repetition' THEN 8
    ELSE NULL
  END AS reps,
  CASE
    WHEN ex.execution_type = 'repetition' THEN false
    ELSE NULL
  END AS reps_to_failure,
  CASE
    WHEN ex.execution_type = 'repetition' AND NOT ex.is_bodyweight THEN 135
    ELSE NULL
  END AS weight_used,
  CASE
    WHEN ex.execution_type = 'time' THEN 5
    ELSE NULL
  END AS duration,
  CASE
    WHEN ex.execution_type = 'distance' THEN 1
    ELSE NULL
  END AS distance
FROM workout_segment_exercise wse
JOIN exercises ex ON ex.id = wse.exercise_id
JOIN LATERAL (
  SELECT gs::INT AS set_order
  FROM generate_series(1, 4) AS gs
) AS set_seed ON true;

-- ================================================================================
-- Sequence Sync (for explicit id seed inserts)
-- ================================================================================

SELECT setval(
  pg_get_serial_sequence('muscle_group', 'id'),
  COALESCE((SELECT MAX(id) FROM muscle_group), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('exercises', 'id'),
  COALESCE((SELECT MAX(id) FROM exercises), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('workout', 'id'),
  COALESCE((SELECT MAX(id) FROM workout), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('workout_segment', 'id'),
  COALESCE((SELECT MAX(id) FROM workout_segment), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('workout_segment_exercise', 'id'),
  COALESCE((SELECT MAX(id) FROM workout_segment_exercise), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('workout_segment_exercise_measurement', 'id'),
  COALESCE((SELECT MAX(id) FROM workout_segment_exercise_measurement), 0) + 1,
  false
);
