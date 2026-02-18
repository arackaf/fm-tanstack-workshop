-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."muscle_group" AS ENUM('chest', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'calves', 'lats', 'back');--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(250) NOT NULL,
	"password" varchar(250) NOT NULL,
	"display_name" varchar(250) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_key" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "workout" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "workout_segment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_segment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_id" integer NOT NULL,
	"segment_order" integer NOT NULL,
	"sets" integer NOT NULL,
	CONSTRAINT "workout_segment_segment_order_check" CHECK (segment_order > 0),
	CONSTRAINT "workout_segment_sets_check" CHECK (sets > 0)
);
--> statement-breakpoint
CREATE TABLE "workout_segment_exercise" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_segment_exercise_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_segment_id" integer NOT NULL,
	"exercise_order" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"reps" integer NOT NULL,
	CONSTRAINT "workout_segment_exercise_exercise_order_check" CHECK (exercise_order > 0),
	CONSTRAINT "workout_segment_exercise_reps_check" CHECK (reps > 0)
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(150),
	"description" text,
	"muscle_groups" "muscle_group"[],
	"is_compound" boolean
);
--> statement-breakpoint
ALTER TABLE "workout_segment" ADD CONSTRAINT "workout_segment_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_segment_exercise" ADD CONSTRAINT "workout_segment_exercise_workout_segment_id_fkey" FOREIGN KEY ("workout_segment_id") REFERENCES "public"."workout_segment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_segment_exercise" ADD CONSTRAINT "workout_segment_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_workout_segment_workout_id_segment_order" ON "workout_segment" USING btree ("workout_id" int4_ops,"segment_order" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_workout_segment_exercise_segment_id_exercise_order" ON "workout_segment_exercise" USING btree ("workout_segment_id" int4_ops,"exercise_order" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_exercises_muscle_groups_gin" ON "exercises" USING gin ("muscle_groups" array_ops);
*/