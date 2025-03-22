const axios = require('axios');

// Base URL for the API
const API_URL = 'http://localhost:3000/api';

// User credentials for login
const credentials = {
  username: 'admin', // Assuming this user exists in your database
  password: 'password123'
};

// Store the JWT token
let token = '';

// Function to login
async function login() {
  try {
    console.log('Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    token = response.data.accessToken;
    console.log('Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to get all users
async function getAllUsers() {
  try {
    console.log('\nGetting all users...');
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Users retrieved successfully!');
    console.log('Users:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Failed to get users:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to get user by ID
async function getUserById(id) {
  try {
    console.log(`\nGetting user with ID: ${id}...`);
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('User retrieved successfully!');
    console.log('User:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to update user by ID
async function updateUser(id, updateData) {
  try {
    console.log(`\nUpdating user with ID: ${id}...`);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const response = await axios.patch(`${API_URL}/users/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('User updated successfully!');
    console.log('Updated user:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to delete user by ID
async function deleteUser(id) {
  try {
    console.log(`\nDeleting user with ID: ${id}...`);
    
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('User deleted successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Failed to delete user:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to logout
async function logout() {
  try {
    console.log('\nLogging out...');
    const response = await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Logout successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to run the simulation
async function runSimulation() {
  try {
    // Step 1: Login
    await login();
    
    // Step 2: Get all users
    const users = await getAllUsers();
    
    if (users && users.length > 0) {
      // Step 3: Get user by ID (using the first user's ID from the list)
      const firstUserId = users[0].id;
      const user = await getUserById(firstUserId);
      
      // Step 4: Update user
      if (user) {
        const updateData = {
          fullName: `${user.fullName} (Updated)`,
          isActive: true
        };
        await updateUser(firstUserId, updateData);
        
        // Get the updated user to verify changes
        await getUserById(firstUserId);
      }
      
      // Step 5: Create a test user for deletion
      const testUserData = {
        username: `testuser_${Date.now()}`,
        password: 'password123',
        fullName: 'Test User',
        email: `testuser_${Date.now()}@example.com`,
        roles: ['user']
      };
      
      // Create a new user using the API
      console.log('\nCreating a test user for deletion...');
      const createResponse = await axios.post(`${API_URL}/users`, testUserData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Test user created successfully!');
      console.log('Created user:', JSON.stringify(createResponse.data, null, 2));
      
      // Step 6: Delete the test user
      if (createResponse.data && createResponse.data.id) {
        await deleteUser(createResponse.data.id);
      }
    } else {
      console.log('No users found to perform operations');
    }
    
    // Step 7: Logout
    await logout();
    
    console.log('\nSimulation completed successfully!');
  } catch (error) {
    console.error('\nSimulation failed:', error.message);
  }
}

// Run the simulation
runSimulation();
