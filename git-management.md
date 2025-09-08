# Git Management Guide - Data Purchase MVP

## Git Workflow Rules

### 🚫 Prohibited Actions
- **NO Claude AI code contributions** - All code must be human-written
- **NO co-authoring** - Single author per commit only
- **NO generic commit messages** - Must be specific and descriptive

### ✅ Required Practices
- **Functional feature-based commits** at regular intervals
- **Timely commits** - Don't let work accumulate
- **Clear commit messages** following conventional format
- **Proper branch management** for features

## Branch Strategy

### Main Branches
```
main (production-ready code)
├── develop (integration branch)
├── feature/network-selection
├── feature/payment-integration
├── feature/data-purchase
└── hotfix/critical-bug-fix
```

### Branch Naming Convention
```
feature/[feature-name]     # New features
bugfix/[bug-description]   # Bug fixes
hotfix/[critical-fix]      # Production hotfixes
chore/[maintenance-task]   # Non-feature work
```

### Examples
```bash
feature/network-selection
feature/phone-validation
feature/ercaspay-integration
feature/gladtidings-api
bugfix/payment-timeout
hotfix/database-connection
chore/update-dependencies
```

## Commit Message Format

### Structure
```
<type>(scope): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code restructuring (no new features)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(frontend): add network selection component
fix(api): resolve payment webhook timeout issue
feat(database): implement transaction schema with drizzle
fix(validation): correct phone number regex for 9mobile
feat(payment): integrate ercaspay payment gateway
feat(data): add gladtidings api client
refactor(components): extract reusable form elements
test(api): add integration tests for payment flow
chore(deps): update next.js to version 15.1
```

## Feature-Based Commit Strategy

### Small, Functional Commits
Each commit should represent a **working, testable piece of functionality**:

```bash
# ❌ Bad - Too large
feat: complete payment system

# ✅ Good - Specific and functional
feat(payment): add ercaspay payment initialization
feat(payment): implement payment status webhook handler
feat(payment): add payment success/failure pages
```

### Commit Frequency Guidelines
- **Every 1-2 hours** of development work
- **After completing each small feature**
- **Before switching context** (different feature/task)
- **At end of each development session**
- **When tests pass** for the current feature

### Functional Milestones
```bash
# Network Selection Feature
feat(frontend): add network selection UI component
feat(api): create data plans endpoint
feat(frontend): connect network selection to api
test(frontend): add network selection component tests

# Phone Validation Feature  
feat(validation): implement nigerian phone number regex
feat(frontend): add phone input component with validation
feat(api): add phone validation middleware
test(validation): add phone number validation tests

# Payment Integration Feature
feat(payment): add ercaspay api client
feat(payment): implement payment initialization endpoint
feat(payment): add payment webhook handler
feat(frontend): create payment form component
test(payment): add payment flow integration tests
```

## .gitignore Configuration

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Build outputs
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs
*.log
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov
.nyc_output

# Dependency directories
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next/

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# IDE and Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Vercel
.vercel

# Supabase
.supabase/

# Local development
.env.example.local
```

## Daily Git Workflow

### 1. Start of Day
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. During Development
```bash
# After completing small functionality (every 1-2 hours)
git add .
git commit -m "feat(component): specific description of what was added"

# Example development session
git commit -m "feat(frontend): add network selection dropdown component"
git commit -m "feat(api): create endpoint to fetch data plans by network"
git commit -m "feat(frontend): connect network selector to data plans api"
git commit -m "style(frontend): improve network selection responsive design"
```

### 3. End of Feature
```bash
# Push feature branch
git push origin feature/your-feature-name

# Create pull request
# Review and merge to develop
```

### 4. Weekly Integration
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main
```

## Quality Gates

### Before Each Commit
1. **Code compiles** without errors
2. **No console errors** in browser/terminal
3. **Basic functionality works** as expected
4. **No sensitive data** in commit (API keys, passwords)

### Before Push
1. **All commits are functional** milestones
2. **Commit messages** follow convention
3. **No WIP or temp commits** in history
4. **Branch is up to date** with develop

## Emergency Procedures

### Quick Bug Fix
```bash
git checkout main
git checkout -b hotfix/critical-issue-description
# Make minimal fix
git commit -m "hotfix(api): fix payment webhook timeout"
git push origin hotfix/critical-issue-description
# Immediate merge to main and develop
```

### Rollback Strategy
```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Reset to previous state (dangerous)
git reset --hard HEAD~1
```

## Automation Rules

### Pre-commit Hooks (Optional)
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### Conventional Commit Validation
```bash
# Add commitizen for consistent commits
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

## Prohibited Patterns

### ❌ Never Do This
```bash
# Generic messages
git commit -m "update"
git commit -m "fix"
git commit -m "wip"

# Multiple unrelated changes
git add .
git commit -m "add payment and fix validation and update ui"

# Large, untested commits
git commit -m "complete entire payment system"

# AI attribution in commits
git commit -m "feat: add feature (generated with Claude AI)"
git commit -m "feat: implement payment system

Co-authored-by: Claude AI <assistant@anthropic.com>"

# Mentioning AI assistance
git commit -m "feat(api): add payment endpoint (AI-assisted)"
```

### ✅ Always Do This
```bash
# Specific, functional commits
git commit -m "feat(payment): implement ercaspay payment initialization"
git commit -m "fix(validation): correct phone number validation for mtn prefixes"
git commit -m "test(api): add unit tests for transaction creation endpoint"

# Single responsibility commits
git add src/components/NetworkSelector.tsx
git commit -m "feat(frontend): add network selection component with validation"

git add src/api/payment.ts
git commit -m "feat(api): implement payment initialization endpoint"
```

---

**Remember**: Every commit should represent a working, functional piece of your application that moves the project forward. No AI contributions, no co-authoring, just clean, human-written, functional code commits.