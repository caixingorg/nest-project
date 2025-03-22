#!/bin/bash

# Exit on error
set -e

echo "=== Migrating from TypeORM to Prisma ==="
echo ""

# Check if Prisma is installed
if ! command -v npx &> /dev/null; then
  echo "Error: npx is not installed. Please install Node.js and npm."
  exit 1
fi

# Step 1: Pull the database schema from the existing database
echo "Step 1: Pulling database schema from existing database..."
npx prisma db pull

# Step 2: Generate Prisma client
echo "Step 2: Generating Prisma client..."
npx prisma generate

# Step 3: Verify the schema
echo "Step 3: Verifying the schema..."
npx prisma validate

echo ""
echo "Migration preparation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review the generated Prisma schema in prisma/schema.prisma"
echo "2. Test with Prisma by setting USE_PRISMA=true in .env"
echo "3. Run the application and verify everything works"
echo "4. Once verified, you can gradually remove TypeORM:"
echo "   - Remove TypeORM dependencies"
echo "   - Remove TypeORM configuration"
echo "   - Remove TypeORM entities"
echo "   - Remove TypeORM repositories"
echo ""
echo "To enable Prisma, run:"
echo "export USE_PRISMA=true && npm run start:dev"
echo ""
