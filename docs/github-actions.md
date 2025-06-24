# GitHub Actions Configuration

This project uses GitHub Actions for continuous integration (CI) and automatic NPM publishing.

## 🔄 Configured Actions

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

- **Trigger**: Push to `main`/`develop` and Pull Requests
- **Testing**: Node.js 18, 20, 22 (matrix)
- **Coverage**: Upload to Codecov
- **Build**: Verify compilation works

### 2. **Release & Publish** (`.github/workflows/release.yml`)

- **Trigger**: GitHub release creation
- **Process**: Test → Build → Publish NPM
- **Version**: Automatic sync with release tag

## ⚙️ Required Configuration

### 1. NPM Token

You need to configure an NPM token in GitHub secrets:

1. Go to [npmjs.com](https://www.npmjs.com/settings/tokens)
2. Create an **Automation Token** (or Classic Token with publish rights)
3. In your GitHub repo: Settings → Secrets and variables → Actions
4. Add a secret named `NPM_TOKEN` with your token

### 2. Permissions

Make sure your repo has the permissions:

- **Actions**: Read and write
- **Contents**: Read and write
- **Metadata**: Read

## 🚀 How to Publish a Release

### Method 1: GitHub Interface

1. Go to the **Releases** tab of your repo
2. Click **Create a new release**
3. Create a tag (e.g., `v1.2.0` or `1.2.0`)
4. Add a title and description
5. Click **Publish release**

### Method 2: Command Line

```bash
# Create and push a tag
git tag v1.2.0
git push origin v1.2.0

# Create release via GitHub CLI
gh release create v1.2.0 --title "Version 1.2.0" --notes "Change description"
```

## 📋 Automatic Release Process

1. **Trigger**: You create a GitHub release
2. **Test Job**:
   - Code checkout
   - Dependencies installation
   - Run tests
   - Build project
3. **Publish Job** (if tests pass):
   - Code checkout
   - Install and build
   - Update version in package.json
   - Publish to NPM
   - Success notification

## 🏷️ Version Management

The system automatically supports:

- Tags with `v` prefix: `v1.2.0` → NPM version `1.2.0`
- Tags without prefix: `1.2.0` → NPM version `1.2.0`
- Semver versions: `1.2.0-beta.1`, `1.2.0-rc.1`, etc.

## ✅ Verification

After a release, check:

- ✅ Tests pass in the action
- ✅ Package is published on [npmjs.com](https://www.npmjs.com/package/a1js)
- ✅ Version matches GitHub tag
- ✅ dist/ files are included in NPM package

## 🐛 Troubleshooting

### NPM publish error

- Verify that `NPM_TOKEN` is valid
- Make sure you have publish rights on the package
- Check that the version doesn't already exist

### Failing tests

- Check locally with `npm test`
- Look at logs in GitHub Actions tab
- Make sure all dependencies are in package.json

### Incorrect version

- GitHub tag must follow semver format
- Use `git tag -d tagname` to delete a local tag
- Use `git push origin :refs/tags/tagname` to delete a remote tag
