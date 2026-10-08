import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, jsonb, doublePrecision, varchar, integer, index, check } from "drizzle-orm/pg-core";

export const charts = pgTable("charts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  name: text("name").notNull(),
  gender: varchar("gender", { length: 16 }).notNull().default("male"),
  birthDate: varchar("birth_date", { length: 16 }).notNull(),
  birthTime: varchar("birth_time", { length: 16 }).notNull(),
  place: text("place").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  timezone: text("timezone").notNull(),
  chartStyle: varchar("chart_style", { length: 16 }).notNull().default("north"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Saved single-chart calculator reports (All Yogas and later tools share this table). */
export const calculatorReports = pgTable("calculator_reports", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  kind: varchar("kind", { length: 40 }).notNull(),
  chartSlug: varchar("chart_slug", { length: 32 }).notNull().references(() => charts.slug, { onUpdate: "cascade" }),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Saved matching calculations; individual charts remain accessible through their own links. */
export const matchReports = pgTable("match_reports", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  firstChartSlug: varchar("first_chart_slug", { length: 32 }).notNull().references(() => charts.slug, { onUpdate: "cascade" }),
  secondChartSlug: varchar("second_chart_slug", { length: 32 }).notNull().references(() => charts.slug, { onUpdate: "cascade" }),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Retained order history; PDF checkout is currently disabled. */
export const pdfOrders = pgTable("pdf_orders", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  chartSlug: varchar("chart_slug", { length: 32 }).notNull().references(() => charts.slug, { onDelete: "restrict", onUpdate: "cascade" }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 64 }).notNull().unique(),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 64 }).unique(),
  amountPaise: integer("amount_paise").notNull(),
  currency: varchar("currency", { length: 3 }).$type<"INR">().notNull().default("INR"),
  status: varchar("status", { length: 16 }).$type<"created" | "paid">().notNull().default("created"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
}, (table) => [
  index("pdf_orders_chart_slug_idx").on(table.chartSlug),
  check("pdf_orders_amount_positive_check", sql`${table.amountPaise} > 0`),
  check("pdf_orders_currency_check", sql`${table.currency} = 'INR'`),
  check("pdf_orders_status_check", sql`${table.status} IN ('created', 'paid')`),
  check(
    "pdf_orders_payment_state_check",
    sql`(${table.status} = 'created' AND ${table.razorpayPaymentId} IS NULL AND ${table.paidAt} IS NULL) OR (${table.status} = 'paid' AND ${table.razorpayPaymentId} IS NOT NULL AND ${table.paidAt} IS NOT NULL)`,
  ),
]);
