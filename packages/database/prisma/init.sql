-- Initialize RepoFlight database
-- This script is run when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The Prisma migrations will handle table creation
-- This file is mainly for any initial setup or extensions