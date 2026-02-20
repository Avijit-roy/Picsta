#!/usr/bin/env node

console.log('=== COMPREHENSIVE AUTH CONTROLLER DIAGNOSTIC ===\n');

// Test 1: Check if file exists
const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'controllers', 'authController.js');
console.log('1. Checking file existence...');
if (fs.existsSync(controllerPath)) {
  console.log('   ✅ File exists:', controllerPath);
} else {
  console.log('   ❌ File NOT found:', controllerPath);
  process.exit(1);
}

// Test 2: Try to require dependencies first
console.log('\n2. Testing dependencies...');
try {
  require('bcrypt');
  console.log('   ✅ bcrypt imported');
} catch (e) {
  console.log('   ❌ bcrypt failed:', e.message);
}

try {
  const User = require('./models/userModel');
  console.log('   ✅ User model imported');
} catch (e) {
  console.log('   ❌ User model failed:', e.message);
}

try {
  const tokenUtils = require('./utils/generateToken');
  console.log('   ✅ generateToken imported');
  console.log('      Available functions:', Object.keys(tokenUtils).join(', '));
} catch (e) {
  console.log('   ❌ generateToken failed:', e.message);
}

try {
  const emailUtils = require('./utils/sendEmail');
  console.log('   ✅ sendEmail imported');
  console.log('      Available functions:', Object.keys(emailUtils).join(', '));
} catch (e) {
  console.log('   ❌ sendEmail failed:', e.message);
}

// Test 3: Try to require authController
console.log('\n3. Testing authController import...');
try {
  const authController = require('./controllers/authController');
  console.log('   ✅ authController imported successfully!');
  
  console.log('\n4. Checking exported functions...');
  const functions = [
    'register',
    'verifyEmail',
    'resendVerificationEmail',
    'login',
    'logout',
    'refreshToken',
    'forgotPassword',
    'verifyResetOTP',
    'verifyResetLink',
    'resetPassword',
    'changePassword',
    'getCurrentUser'
  ];
  
  let allGood = true;
  functions.forEach(func => {
    const exists = typeof authController[func] === 'function';
    const symbol = exists ? '✅' : '❌';
    const type = typeof authController[func];
    console.log(`   ${symbol} ${func.padEnd(25)} - ${type}`);
    if (!exists) allGood = false;
  });
  
  if (allGood) {
    console.log('\n✅ ALL FUNCTIONS PRESENT - The problem is elsewhere!');
  } else {
    console.log('\n❌ SOME FUNCTIONS MISSING - authController has errors');
  }
  
  console.log('\n5. All exported keys:');
  console.log('   ', Object.keys(authController).join(', '));
  
} catch (error) {
  console.log('   ❌ authController import FAILED');
  console.log('\n   Error message:', error.message);
  console.log('\n   Stack trace:');
  console.log(error.stack);
  console.log('\n❌ THIS IS THE PROBLEM - Fix the error above');
}

console.log('\n=== DIAGNOSTIC COMPLETE ===');