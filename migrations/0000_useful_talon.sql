CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"fato" text NOT NULL,
	"fato_complementar" text,
	"unidade" text NOT NULL,
	"cidade" text NOT NULL,
	"data_hora" timestamp NOT NULL,
	"local_rua" text NOT NULL,
	"local_numero" text NOT NULL,
	"local_bairro" text NOT NULL,
	"envolvidos" jsonb NOT NULL,
	"oficial" text NOT NULL,
	"material" jsonb NOT NULL,
	"resumo" text NOT NULL,
	"motivacao" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
