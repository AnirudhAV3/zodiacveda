BEGIN;

CREATE TABLE IF NOT EXISTS calculator_reports (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(32) NOT NULL UNIQUE,
  kind VARCHAR(40) NOT NULL,
  chart_slug VARCHAR(32) NOT NULL REFERENCES charts(slug),
  data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_reports (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(32) NOT NULL UNIQUE,
  first_chart_slug VARCHAR(32) NOT NULL REFERENCES charts(slug),
  second_chart_slug VARCHAR(32) NOT NULL REFERENCES charts(slug),
  data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pdf_orders (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(32) NOT NULL UNIQUE,
  chart_slug VARCHAR(32) NOT NULL REFERENCES charts(slug) ON DELETE RESTRICT,
  razorpay_order_id VARCHAR(64) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(64) UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  status VARCHAR(16) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP,
  CONSTRAINT pdf_orders_payment_state_check CHECK (
    (status = 'created' AND razorpay_payment_id IS NULL AND paid_at IS NULL) OR
    (status = 'paid' AND razorpay_payment_id IS NOT NULL AND paid_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS pdf_orders_chart_slug_idx ON pdf_orders(chart_slug);

DO $$
BEGIN
  ALTER TABLE pdf_orders ADD CONSTRAINT pdf_orders_payment_state_check CHECK (
    (status = 'created' AND razorpay_payment_id IS NULL AND paid_at IS NULL) OR
    (status = 'paid' AND razorpay_payment_id IS NOT NULL AND paid_at IS NOT NULL)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMIT;
