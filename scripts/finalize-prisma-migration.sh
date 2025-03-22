#!/bin/bash

# Exit on error
set -e

echo "=== Finalizing Migration from TypeORM to Prisma ==="
echo ""

# Check if USE_PRISMA is set to true in .env
if ! grep -q "USE_PRISMA=true" .env; then
  echo "Error: USE_PRISMA is not set to true in .env file."
  echo "Please test the application with Prisma first by setting USE_PRISMA=true in .env"
  echo "and running the application to ensure everything works correctly."
  exit 1
fi

# Step 1: Remove TypeORM dependencies
echo "Step 1: Removing TypeORM dependencies..."
pnpm remove @nestjs/typeorm typeorm

# Step 2: Remove TypeORM configuration
echo "Step 2: Removing TypeORM configuration..."
rm -rf src/config/database/database.config.ts

# Step 3: Update app.module.ts to remove TypeORM
echo "Step 3: Updating app.module.ts to remove TypeORM..."
sed -i '' '/TypeOrmModule/d' src/app.module.ts
sed -i '' '/TypeOrmConfigService/d' src/app.module.ts

# Step 4: Clean up user module
echo "Step 4: Cleaning up user module..."
sed -i '' '/TypeOrmModule/d' src/app/modules/user/user.module.ts
sed -i '' '/InjectRepository/d' src/app/modules/user/user.service.ts
sed -i '' '/Repository/d' src/app/modules/user/user.service.ts
sed -i '' '/typeormUserRepository/d' src/app/modules/user/user.service.ts

# Step 5: Update .env to remove USE_PRISMA flag
echo "Step 5: Updating .env to remove USE_PRISMA flag..."
sed -i '' '/USE_PRISMA/d' .env

echo ""
echo "Migration finalization completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review the changes to ensure everything looks correct"
echo "2. Run the application to verify it works with Prisma only"
echo "3. Update any remaining references to TypeORM in the codebase"
echo "4. Remove any unused TypeORM entities and migrations"
echo ""
echo "To run the application, use:"
echo "pnpm run start:dev"
echo ""
