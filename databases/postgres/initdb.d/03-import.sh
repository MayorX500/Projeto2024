#!/bin/bash
## Import the dump file into the database
echo "Importing dump..."
export PGPASSWORD=postgres
psql -U postgres -p 5432 -d postgres < /datasets/dump.sql
