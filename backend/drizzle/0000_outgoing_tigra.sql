CREATE TABLE "data_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"network" varchar(20) NOT NULL,
	"plan_name" varchar(100) NOT NULL,
	"data_amount" varchar(50) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2),
	"validity" varchar(50) NOT NULL,
	"plan_type" varchar(50),
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"base_url" varchar(255) NOT NULL,
	"api_key" text,
	"config" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "data_providers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"ercaspay_reference" varchar(100),
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_plan_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_plan_id" uuid NOT NULL,
	"data_provider_id" uuid NOT NULL,
	"provider_plan_id" varchar(100) NOT NULL,
	"provider_network_id" varchar(20),
	"provider_metadata" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"network" varchar(20) NOT NULL,
	"data_plan_id" uuid NOT NULL,
	"data_plan_name" varchar(100) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_reference" varchar(100),
	"data_provider_id" uuid,
	"provider_reference" varchar(100),
	"provider_response" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(50) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"reference_id" varchar(100) NOT NULL,
	"transaction_id" uuid,
	"payload" json NOT NULL,
	"status" varchar(20) DEFAULT 'received' NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_plan_mappings" ADD CONSTRAINT "provider_plan_mappings_data_plan_id_data_plans_id_fk" FOREIGN KEY ("data_plan_id") REFERENCES "public"."data_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_plan_mappings" ADD CONSTRAINT "provider_plan_mappings_data_provider_id_data_providers_id_fk" FOREIGN KEY ("data_provider_id") REFERENCES "public"."data_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_data_plan_id_data_plans_id_fk" FOREIGN KEY ("data_plan_id") REFERENCES "public"."data_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_data_provider_id_data_providers_id_fk" FOREIGN KEY ("data_provider_id") REFERENCES "public"."data_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;