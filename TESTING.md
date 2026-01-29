# Testing Guide

This project has comprehensive unit tests for all features and APIs. Tests run automatically before every build and deployment.

## Quick Start

```bash
# Run all tests
pnpm test

# Run tests in watch mode (during development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests in CI mode (what runs on GitHub/Vercel)
pnpm test:ci
```

## Test Structure

```
__tests__/
├── lib/                          # Library function tests
│   ├── storage-local.test.ts     # Local storage adapter
│   ├── storage-vercel-blob.test.ts # Vercel Blob adapter
│   ├── storage-factory.test.ts   # Storage factory/auto-detection
│   └── entries.test.ts           # Entry CRUD operations
├── api/                          # API route tests
│   ├── upload.test.ts            # Photo upload API
│   ├── entries-create.test.ts    # Create entry API
│   └── entries-delete.test.ts    # Delete entry API
└── components/                   # Component tests
    ├── EntryCard.test.tsx        # Entry card component
    └── PhotoUpload.test.tsx      # Photo upload component
```

## What's Tested

### ✅ Storage Layer (lib/storage/)
- **LocalStorageAdapter**: File system operations (entries & photos)
- **VercelBlobAdapter**: Blob storage operations
- **Storage Factory**: Auto-detection based on environment
- All CRUD operations (Create, Read, Update, Delete)
- Error handling and edge cases

### ✅ API Routes (app/api/)
- **Upload API**: Photo upload with HEIC conversion
- **Create Entry API**: Entry creation with authentication
- **Delete Entry API**: Entry deletion with cascade (photos)
- Authentication checks (401 for unauthorized)
- Input validation (400 for bad requests)
- Error handling (500 for server errors)

### ✅ Components (components/)
- **EntryCard**: Display, formatting, linking, photo count
- **PhotoUpload**: Upload, drag-and-drop, captions, reordering, removal
- User interactions (click, type, drag)
- Loading and error states

### ✅ Entry Library (lib/entries.ts)
- getAllEntries() - List all entries
- getEntryByDate() - Get single entry
- createEntry() - Create new entry
- deleteEntry() - Delete entry with cascade

## Test Coverage

Target coverage: **80%+**

View coverage report:
```bash
pnpm test:coverage
```

Coverage report will be in `coverage/lcov-report/index.html`

## Running Tests Locally

### Prerequisites
```bash
pnpm install
```

### Run All Tests
```bash
pnpm test
```

### Run Specific Test File
```bash
pnpm test storage-local
pnpm test upload
pnpm test EntryCard
```

### Watch Mode (Auto-rerun on Changes)
```bash
pnpm test:watch
```

### Debug Tests
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome.

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop`

Workflow: `.github/workflows/test.yml`

**Matrix Testing:**
- Node.js 18.x
- Node.js 20.x

**Steps:**
1. Lint code
2. Run unit tests
3. Generate coverage report
4. Build application
5. Full verification

### Vercel Integration

Tests run before every deployment:

**Pre-Build Hook** (in `package.json`):
```json
{
  "scripts": {
    "prebuild": "pnpm run test"
  }
}
```

This means:
- `pnpm run build` → Automatically runs `pnpm test` first
- Vercel deployment → Runs `build` → Runs tests → Fails if tests fail

### Manual Verification

Run the full verification suite:
```bash
pnpm run verify
```

This runs:
1. ESLint (code quality)
2. Jest (unit tests with coverage)
3. Next.js build (production build)

## Writing New Tests

### Test File Naming

```
__tests__/
  lib/my-module.test.ts        # For lib/my-module.ts
  api/my-route.test.ts         # For app/api/my-route/route.ts
  components/MyComponent.test.tsx  # For components/MyComponent.tsx
```

### Test Template

```typescript
import { myFunction } from '@/lib/my-module';

describe('myFunction', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  it('should handle errors', () => {
    expect(() => myFunction(null)).toThrow('Error message');
  });
});
```

### Mocking

#### Mock a Module
```typescript
jest.mock('@/lib/storage');
```

#### Mock fetch
```typescript
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' }),
});
```

#### Mock Next.js Components
```typescript
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
```

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle clicks', () => {
    const onClick = jest.fn();
    render(<MyComponent onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should handle user input', async () => {
    render(<MyComponent />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });
});
```

### API Route Testing

```typescript
import { POST } from '@/app/api/my-route/route';
import { NextRequest } from 'next/server';

describe('My API Route', () => {
  it('should return 200 on success', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ data: 'test' }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it('should return 401 when unauthorized', async () => {
    // Test implementation
  });
});
```

## Best Practices

### ✅ Do's

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names (`should do X when Y`)
- ✅ Test edge cases and error conditions
- ✅ Mock external dependencies (API calls, file system)
- ✅ Keep tests independent and isolated
- ✅ Use `beforeEach` for setup, `afterEach` for cleanup
- ✅ Test user interactions (clicks, typing, drag-and-drop)
- ✅ Verify loading and error states
- ✅ Test authentication and authorization

### ❌ Don'ts

- ❌ Don't test implementation details
- ❌ Don't test third-party libraries
- ❌ Don't make real API calls
- ❌ Don't share state between tests
- ❌ Don't test everything (focus on critical paths)
- ❌ Don't write tests that depend on execution order
- ❌ Don't mock everything (test real code when possible)

## Debugging Failed Tests

### 1. Read the Error Message
```
FAIL __tests__/lib/entries.test.ts
  ● getAllEntries › should return entries

  Expected: [{"id": "123"}]
  Received: []
```

### 2. Run Single Test in Watch Mode
```bash
pnpm test:watch entries
```

### 3. Add console.log for Debugging
```typescript
it('should do something', () => {
  const result = myFunction('input');
  console.log('Result:', result); // Debug output
  expect(result).toBe('expected');
});
```

### 4. Check Mocks
```typescript
expect(mockFunction).toHaveBeenCalledWith('expected', 'args');
console.log(mockFunction.mock.calls); // See all calls
```

## Common Issues

### Issue: Tests pass locally but fail in CI

**Solution:**
- Check environment variables in `.github/workflows/test.yml`
- Ensure all dependencies are in `package.json`
- Check for timezone-dependent tests (use fixed dates)

### Issue: "Cannot find module '@/...'"

**Solution:**
- Check `jest.config.js` has correct `moduleNameMapper`
- Ensure `tsconfig.json` has correct paths

### Issue: "ReferenceError: fetch is not defined"

**Solution:**
```typescript
global.fetch = jest.fn();
```

### Issue: Tests timeout

**Solution:**
```typescript
it('should do something', async () => {
  // Your test
}, 10000); // 10 second timeout
```

Or in jest.config.js:
```javascript
module.exports = {
  testTimeout: 10000
};
```

## Test Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:ci` | Run tests in CI mode (what CI uses) |
| `pnpm run verify` | Run lint + tests + build |
| `pnpm run lint` | Run ESLint |
| `pnpm run build` | Build (runs tests first via prebuild) |

## Coverage Thresholds

Minimum coverage requirements:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

To adjust thresholds, edit `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  }
}
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Questions?

Check the main documentation or open an issue on GitHub.
