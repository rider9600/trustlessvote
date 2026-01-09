# TrustlessVote - Supabase Backend Integration

## ✅ Server Running
Your application is now running at: **http://localhost:8080/**

## 🚀 Quick Start

### 1. Create Test Users in Supabase

Since we're using Supabase Authentication, you need to create users first:

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project: https://iliaxwhklkjaiaatxcja.supabase.co
2. Navigate to **Authentication** → **Users**
3. Click "Add User" (or "Invite User")
4. Create an **Admin User**:
   - Email: `admin@trustlessvote.com`
   - Password: `admin123456` (or your choice)
5. Create a **Voter User**:
   - Email: `voter@trustlessvote.com`
   - Password: `voter123456` (or your choice)

#### Option B: Sign Up Through the App
1. Open http://localhost:8080/
2. You'll need to modify the Login page to add a "Sign Up" link
3. Or manually insert into Supabase

### 2. Add User Profiles in Supabase

After creating auth users, you need to add their profiles:

1. Go to **Table Editor** → **profiles** table
2. Click "Insert row"
3. Add admin profile:
   ```
   id: [copy the UUID from auth.users]
   full_name: Admin User
   email: admin@trustlessvote.com
   role: admin
   ```
4. Add voter profile:
   ```
   id: [copy the UUID from auth.users]
   full_name: Voter User
   email: voter@trustlessvote.com
   role: voter
   ```

### 3. Test the Application

#### Test Admin Flow:
1. Open http://localhost:8080/
2. Login as admin (right side panel)
3. You'll be redirected to `/admin/dashboard`
4. Click "Create New Election"
5. Fill in election details, add voters, add candidates
6. Save election - it will be stored in Supabase!

#### Test Voter Flow:
1. Open http://localhost:8080/
2. Login as voter (left side panel)
3. You'll be redirected to `/voter` dashboard
4. View elections you're assigned to
5. Click on an election to see details

## 📁 What's Integrated with Supabase

### ✅ Completed Integrations:

1. **Authentication** ([auth.service.ts](src/services/auth.service.ts))
   - Sign up, sign in, sign out
   - Profile management
   - Role-based access (admin/voter)

2. **Elections** ([elections.service.ts](src/services/elections.service.ts))
   - Create, read, update, delete elections
   - Election phases management
   - Admin statistics

3. **Candidates** ([candidates.service.ts](src/services/candidates.service.ts))
   - Add candidates to elections
   - Candidate manifestos (vision, policies, promises)
   - Get candidates with manifestos

4. **Voters** ([voters.service.ts](src/services/voters.service.ts))
   - Add voters to elections
   - Track voter status (eligible, committed, revealed)
   - Bulk voter operations

5. **Pages Updated:**
   - ✅ Login - Real Supabase authentication
   - ✅ AdminDashboard - Fetches elections from database
   - ✅ CreateElection - Saves to database
   - ✅ VoterDashboard - Shows voter's elections
   - ✅ ElectionDetails - Displays election data

## 🔧 Database Tables in Use

- `profiles` - User accounts (admin/voter)
- `elections` - Election records
- `election_phases` - Commit/reveal phase timing
- `candidates` - Election candidates
- `candidate_manifestos` - Candidate policies & promises
- `election_voters` - Voter-election relationships
- `election_blockchain_map` - Smart contract addresses
- `admin_election_stats` - Admin dashboard statistics

## 🐛 Troubleshooting

### "Invalid credentials" on login
- Make sure you created the user in Supabase Authentication
- Check that the email/password match

### "Profile not found"
- Add profile record in `profiles` table with same ID as auth user

### "No elections showing"
- Create an election as admin first
- Make sure election has `admin_id` matching your admin profile

### Server not running
```bash
cd C:\Users\HP\OneDrive\Desktop\Sem\Hack\trustlessvote
npm run dev
```

## 📝 Next Steps

1. **Add Row Level Security (RLS)** in Supabase for data protection
2. **Create sample data** script to populate test elections
3. **Add wallet connection** for blockchain integration
4. **Implement actual voting** with commit-reveal mechanism
5. **Add real-time updates** using Supabase subscriptions

## 🎉 Your App is Live!

Open **http://localhost:8080/** and start testing! 🚀
