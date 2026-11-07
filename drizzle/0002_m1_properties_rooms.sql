CREATE TABLE "rooms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rooms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"code" text NOT NULL,
	"room_type" text,
	"base_rent_amount" bigint NOT NULL,
	"facilities" text,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "rooms_status_check" CHECK ("rooms"."status" in ('AVAILABLE', 'OCCUPIED', 'BROKEN')),
	CONSTRAINT "rooms_base_rent_check" CHECK ("rooms"."base_rent_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "has_facilities" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "electricity_managed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "electricity_pattern" text DEFAULT 'A' NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_property_code_key" ON "rooms" USING btree ("property_id",lower("code")) WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "rooms_org_property_status_idx" ON "rooms" USING btree ("organization_id","property_id","status");--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_electricity_pattern_check" CHECK ("properties"."electricity_pattern" in ('A', 'B', 'C', 'D', 'E', 'CUSTOM'));