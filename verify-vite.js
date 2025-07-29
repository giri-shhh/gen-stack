#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Vite Configuration...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'index.html',
  '.eslintrc.cjs',
  'src/index.js',
  'src/App.js',
  'tailwind.config.js',
  'postcss.config.js'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check package.json for Vite dependencies
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log('\n📦 Checking package.json...');
  
  // Check for Vite in devDependencies
  if (packageJson.devDependencies && packageJson.devDependencies.vite) {
    console.log('✅ Vite is in devDependencies');
  } else {
    console.log('❌ Vite is missing from devDependencies');
    allFilesExist = false;
  }
  
  // Check for @vitejs/plugin-react
  if (packageJson.devDependencies && packageJson.devDependencies['@vitejs/plugin-react']) {
    console.log('✅ @vitejs/plugin-react is in devDependencies');
  } else {
    console.log('❌ @vitejs/plugin-react is missing from devDependencies');
    allFilesExist = false;
  }
  
  // Check scripts
  const requiredScripts = ['dev', 'build', 'preview'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script} script exists`);
    } else {
      console.log(`❌ ${script} script missing`);
      allFilesExist = false;
    }
  });
  
  // Check for type: module
  if (packageJson.type === 'module') {
    console.log('✅ type: module is set');
  } else {
    console.log('❌ type: module is missing');
    allFilesExist = false;
  }
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Check Vite config
try {
  const viteConfig = fs.readFileSync('vite.config.js', 'utf8');
  if (viteConfig.includes('@vitejs/plugin-react')) {
    console.log('✅ Vite config includes React plugin');
  } else {
    console.log('❌ Vite config missing React plugin');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Error reading vite.config.js:', error.message);
  allFilesExist = false;
}

// Check index.html
try {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  if (indexHtml.includes('src="/src/index.js"')) {
    console.log('✅ index.html has correct script reference');
  } else {
    console.log('❌ index.html missing correct script reference');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Error reading index.html:', error.message);
  allFilesExist = false;
}

console.log('\n📋 Summary:');
if (allFilesExist) {
  console.log('🎉 All Vite configuration checks passed!');
  console.log('\n🚀 You can now run:');
  console.log('   npm run dev    # Start development server');
  console.log('   npm run build  # Build for production');
  console.log('   npm run preview # Preview production build');
} else {
  console.log('⚠️  Some configuration issues found. Please check the errors above.');
}

console.log('\n✨ Vite migration complete!'); 