-- Add service_id column to orders table to store selected Furgonetka service
ALTER TABLE orders ADD COLUMN service_id INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN orders.service_id IS 'Furgonetka service ID selected during checkout';