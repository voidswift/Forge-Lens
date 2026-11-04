CREATE TABLE "commits" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"message" text NOT NULL,
	"author_name" text NOT NULL,
	"author_email" text NOT NULL,
	"url" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributors" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"score" integer NOT NULL,
	"trend" text NOT NULL,
	"expertise" text,
	"last_active" timestamp,
	"algorithm_version" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" integer PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"state" text NOT NULL,
	"url" text NOT NULL,
	"author_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_id" integer NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"is_private" boolean NOT NULL,
	"sync_status" text DEFAULT 'PENDING' NOT NULL,
	"description" text,
	"language" text,
	"stars" integer DEFAULT 0,
	"forks" integer DEFAULT 0,
	"watchers" integer DEFAULT 0,
	"license" text,
	"last_synced_at" timestamp,
	"bus_factor" integer,
	"health_score" integer,
	"health_algorithm_version" text,
	"health_evidence" json,
	"resilience_score" integer,
	"resilience_algorithm_version" text,
	"resilience_evidence" json,
	"commits_cursor" text,
	"prs_cursor" text,
	"is_syncing" boolean DEFAULT false,
	"is_showcase" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repositories_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "repository_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"repository_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"health_score" integer,
	"resilience_score" integer,
	"bus_factor" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"github_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "commits" ADD CONSTRAINT "commits_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributors" ADD CONSTRAINT "contributors_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_snapshots" ADD CONSTRAINT "repository_snapshots_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "repo_time_idx" ON "commits" USING btree ("repository_id","timestamp");--> statement-breakpoint
CREATE INDEX "commits_repo_idx" ON "commits" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "prs_repo_idx" ON "pull_requests" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repo_state_idx" ON "pull_requests" USING btree ("repository_id","state");--> statement-breakpoint
CREATE INDEX "repo_updated_idx" ON "pull_requests" USING btree ("repository_id","updated_at");