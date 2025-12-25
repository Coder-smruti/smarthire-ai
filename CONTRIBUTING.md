# Contributing to SmartHire AI

Thank you for your interest in contributing to SmartHire AI! 🎉

This document provides guidelines for contributing to this project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## 🤝 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and encourage diverse perspectives
- Focus on what is best for the community
- Show empathy towards other community members

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:
- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (Google Apps Script version, browser, etc.)
- **Error messages** or logs

**Example:**
```
Title: "Phase 2 form generator fails with special characters in questions"

Description:
When creating a form with questions containing quotation marks or special 
characters, the form creation fails with error "Invalid character in question text"

Steps to reproduce:
1. Add question: What's your experience with "Python"?
2. Click "Create Interview Form"
3. Error appears

Expected: Form creates successfully with escaped special characters
Actual: Error and form creation fails

Environment: Google Workspace, Chrome 120
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

Include:
- **Clear title** describing the enhancement
- **Detailed description** of the proposed functionality
- **Use case** explaining why this would be valuable
- **Mockups or examples** if applicable

### Code Contributions

1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

---

## 🛠️ Development Setup

### Prerequisites

- Google account
- OpenAI API key
- Code editor (VS Code recommended)
- Git installed

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/smarthire-ai.git
cd smarthire-ai
```

2. **Create test Google Sheet:**
- Go to sheets.google.com
- Create new spreadsheet: "SmartHire AI - Dev"
- Enable Apps Script: Extensions > Apps Script

3. **Copy development code:**
- Copy code from `src/smarthire-ai-complete-system.gs`
- Paste into Apps Script editor
- Add your OpenAI API key
- Save and test

4. **Test each phase:**
- Run setupAllPhases()
- Test Phase 1: Generate JD
- Test Phase 2: Create Form
- Test Phase 3: Schedule Interview

---

## 📝 Coding Standards

### JavaScript Style Guide

**General Principles:**
- Use ES6+ features where supported
- Write clear, self-documenting code
- Add comments for complex logic
- Follow DRY (Don't Repeat Yourself)

**Naming Conventions:**
```javascript
// Constants: UPPER_SNAKE_CASE
const OPENAI_API_KEY = '...';
const JD_SHEET_NAME = 'Job Descriptions';

// Functions: camelCase with descriptive verbs
function generateJobDescription() { }
function scheduleInterview() { }

// Variables: camelCase
const candidateName = 'John Doe';
const interviewDate = new Date();
```

**Code Structure:**
```javascript
/**
 * Function description
 * @param {string} param1 - Description
 * @param {number} param2 - Description
 * @return {boolean} - Description
 */
function myFunction(param1, param2) {
  // Validate inputs
  if (!param1) return false;
  
  // Main logic
  try {
    // ... implementation
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

**Best Practices:**
- Always handle errors with try-catch
- Validate user inputs
- Log errors for debugging
- Show user-friendly error messages
- Use const for values that don't change
- Use let for variables that do change
- Avoid var

---

## 📜 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(phase1): add multi-language JD generation

- Add language selection dropdown
- Integrate Google Translate API
- Update prompt to specify target language
- Add 5 language options: EN, ES, FR, DE, HI

Closes #45
```

```
fix(phase3): calendar event creation fails with timezone

- Convert dates to user's timezone before creating event
- Add timezone detection function
- Update documentation with timezone handling

Fixes #67
```

```
docs(readme): update installation instructions

- Add troubleshooting section
- Include screenshots of setup process
- Clarify API key configuration steps
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if you're changing functionality
2. **Add/update tests** if applicable
3. **Run existing tests** to ensure nothing breaks
4. **Follow code style** guidelines
5. **Update CHANGELOG.md** with your changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Phase 1 tested
- [ ] Phase 2 tested
- [ ] Phase 3 tested
- [ ] Integration tested

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)

## Related Issues
Closes #(issue number)
```

### Review Process

1. Maintainer reviews code
2. Requests changes if needed
3. You address feedback
4. Maintainer approves
5. PR merged to main

---

## 🧪 Testing

### Manual Testing Checklist

**Phase 1:**
- [ ] Generate JD with all fields filled
- [ ] Generate JD with only required fields
- [ ] Test with invalid API key
- [ ] Test with missing required fields
- [ ] Verify output format and quality

**Phase 2:**
- [ ] Create form with all question types
- [ ] Create form with required/optional mix
- [ ] Verify form URL is saved
- [ ] Check response collection
- [ ] Test with special characters in questions

**Phase 3:**
- [ ] Schedule interview with valid data
- [ ] Test without interview date
- [ ] Test without candidate email
- [ ] Verify calendar event created
- [ ] Verify Meet link generated
- [ ] Check email notifications sent

**Integration:**
- [ ] Test complete workflow (Phase 1 → 2 → 3)
- [ ] Verify menu displays correctly
- [ ] Check error handling across phases
- [ ] Test with multiple candidates
- [ ] Verify data persistence

### Test Cases

Document test cases in format:
```
Test Case ID: TC-P1-001
Phase: 1
Feature: JD Generation
Description: Verify JD generation with all fields
Precondition: API key configured
Steps:
  1. Fill all input fields (B3-B10)
  2. Click "Generate Job Description"
  3. Wait for completion
Expected Result:
  - JD appears in B12
  - Timestamp in B13
  - Success message displayed
Actual Result: [Pass/Fail]
Notes: [Any observations]
```

---

## 📞 Getting Help

Stuck? Need clarification?

- **GitHub Discussions:** Ask questions
- **Email:** smrutijena1422@gmail.com
- **Documentation:** Check docs/ folder

---

## 🎖️ Recognition

Contributors will be:
- Added to README contributors section
- Mentioned in release notes
- Given credit in commit history

Thank you for making SmartHire AI better! 🚀

---

**Maintained by:** Smrutimanjari Jena  
**Last Updated:** December 26, 2024
