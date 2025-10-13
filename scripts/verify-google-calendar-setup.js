/**
 * Google Calendar Integration Setup Verification
 * Run: node scripts/verify-google-calendar-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Google Calendar Integration Setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment variables
console.log('1️⃣  Checking environment variables...');
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('   ❌ .env.local file not found');
  console.log('   → Create .env.local file in project root');
  hasErrors = true;
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
  ];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      console.log(`   ❌ Missing ${varName}`);
      hasErrors = true;
    } else if (envContent.includes(`${varName}=your_`) || envContent.includes(`${varName}=`)) {
      // Check if it's just a placeholder
      const match = envContent.match(new RegExp(`${varName}=(.+)`));
      if (match && (match[1].startsWith('your_') || match[1].trim() === '')) {
        console.log(`   ⚠️  ${varName} appears to be a placeholder`);
        hasWarnings = true;
      } else {
        console.log(`   ✅ ${varName} is set`);
      }
    } else {
      console.log(`   ✅ ${varName} is set`);
    }
  });
}

// Check 2: Required files
console.log('\n2️⃣  Checking required files...');
const requiredFiles = [
  'src/lib/google-calendar.ts',
  'src/app/api/google-calendar/auth/route.ts',
  'src/app/api/google-calendar/callback/route.ts',
  'src/app/api/google-calendar/sync/route.ts',
  'src/app/api/google-calendar/disconnect/route.ts',
  'src/app/api/google-calendar/create-event/route.ts',
  'src/components/calendar/GoogleCalendarConnect.tsx',
  'supabase/supabase-google-calendar-tokens.sql',
  'supabase/supabase-meetings-google-sync.sql',
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} not found`);
    hasErrors = true;
  }
});

// Check 3: Package dependencies
console.log('\n3️⃣  Checking npm packages...');
const packageJsonPath = path.join(process.cwd(), 'package.json');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = ['googleapis'];
  
  requiredPackages.forEach(pkg => {
    if (dependencies[pkg]) {
      console.log(`   ✅ ${pkg} installed (${dependencies[pkg]})`);
    } else {
      console.log(`   ❌ ${pkg} not installed`);
      console.log(`   → Run: npm install ${pkg}`);
      hasErrors = true;
    }
  });
} else {
  console.log('   ❌ package.json not found');
  hasErrors = true;
}

// Check 4: SQL files content
console.log('\n4️⃣  Checking SQL migration files...');
const sqlFiles = [
  'supabase/supabase-google-calendar-tokens.sql',
  'supabase/supabase-meetings-google-sync.sql',
];

sqlFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('CREATE TABLE') || content.includes('ALTER TABLE')) {
      console.log(`   ✅ ${file} looks valid`);
    } else {
      console.log(`   ⚠️  ${file} might be incomplete`);
      hasWarnings = true;
    }
  }
});

// Check 5: Documentation
console.log('\n5️⃣  Checking documentation...');
const docs = [
  'GOOGLE_CALENDAR_INTEGRATION.md',
  'GOOGLE_CALENDAR_QUICKSTART.md',
];

docs.forEach(doc => {
  const docPath = path.join(process.cwd(), doc);
  if (fs.existsSync(docPath)) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ⚠️  ${doc} not found`);
    hasWarnings = true;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));

if (!hasErrors && !hasWarnings) {
  console.log('✅ All checks passed! You\'re ready to integrate Google Calendar.');
  console.log('\n📖 Next steps:');
  console.log('   1. Run the SQL scripts in Supabase SQL Editor');
  console.log('   2. Configure Google Cloud Console OAuth settings');
  console.log('   3. Start your dev server: npm run dev');
  console.log('   4. Navigate to your calendar page');
  console.log('   5. Click "Connect Google Calendar"');
} else if (hasErrors) {
  console.log('❌ Setup incomplete. Please fix the errors above.');
  console.log('\n📖 See GOOGLE_CALENDAR_QUICKSTART.md for setup instructions');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Setup mostly complete, but some warnings need attention.');
  console.log('\n📖 Review the warnings above before proceeding');
}

console.log('\n' + '='.repeat(60));
console.log('📚 Documentation:');
console.log('   • Quick Start: GOOGLE_CALENDAR_QUICKSTART.md');
console.log('   • Full Guide:  GOOGLE_CALENDAR_INTEGRATION.md');
console.log('='.repeat(60) + '\n');





