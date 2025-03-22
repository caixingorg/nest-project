#!/bin/bash

# Base URL for the API
API_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# User credentials for login
USERNAME="admin"
PASSWORD="password123"

echo -e "${BLUE}=== Authentication and User API Simulation ===${NC}\n"

# Step 1: Login to get JWT token
echo -e "${BLUE}Step 1: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

# Check if login was successful
if [[ $LOGIN_RESPONSE == *"accessToken"* ]]; then
  echo -e "${GREEN}Login successful!${NC}"
  # Extract the token using grep and cut
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo -e "Response: $LOGIN_RESPONSE\n"
else
  echo -e "${RED}Login failed!${NC}"
  echo -e "Response: $LOGIN_RESPONSE\n"
  exit 1
fi

# Step 2: Get all users using the JWT token
echo -e "${BLUE}Step 2: Getting all users...${NC}"
USERS_RESPONSE=$(curl -s -X GET "${API_URL}/users" \
  -H "Authorization: Bearer ${TOKEN}")

# Check if users were retrieved
if [[ $? -eq 0 ]]; then
  echo -e "${GREEN}Users retrieved successfully!${NC}"
  echo -e "Users: $USERS_RESPONSE\n"
else
  echo -e "${RED}Failed to get users!${NC}"
  echo -e "Response: $USERS_RESPONSE\n"
  exit 1
fi

# Step 3: Logout
echo -e "${BLUE}Step 3: Logging out...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "${API_URL}/auth/logout" \
  -H "Authorization: Bearer ${TOKEN}")

# Check if logout was successful
if [[ $? -eq 0 ]]; then
  echo -e "${GREEN}Logout successful!${NC}"
  echo -e "Response: $LOGOUT_RESPONSE\n"
else
  echo -e "${RED}Logout failed!${NC}"
  echo -e "Response: $LOGOUT_RESPONSE\n"
  exit 1
fi

echo -e "${GREEN}Simulation completed successfully!${NC}"
