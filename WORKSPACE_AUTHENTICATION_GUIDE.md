# Workspace Authentication Guide

This guide explains how to authenticate with a Twenty workspace to test Lead objects in GraphQL.

## Quick Start

### Option 1: Using the Twenty UI (Recommended)

1. **Start the Twenty server:**
   ```bash
   npx nx start twenty-server
   ```

2. **Open the Twenty UI:**
   Navigate to `http://localhost:3000` in your browser

3. **Sign in with prefilled credentials:**
   - Click "Continue with Email"
   - The form will be auto-filled with test credentials (if `SIGN_IN_PREFILLED=true` in `.env`)
   - Click "Continue" to sign in

4. **Get your authentication token:**
   - Open browser DevTools (F12)
   - Go to the "Application" or "Storage" tab
   - Look for `tokenPair` in Local Storage
   - Copy the `accessToken` value

5. **Use the token in GraphQL Playground:**
   - Go to `http://localhost:3000/graphql`
   - Add the Authorization header:
     ```
     Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
     ```
   - Now you can query Lead objects!

### Option 2: Using API Tokens (For Automation)

1. **Create an API key through the UI:**
   - Sign in to Twenty at `http://localhost:3000`
   - Go to Settings → Developers → API Keys
   - Click "Create API Key"
   - Give it a name and copy the generated token

2. **Use the API token in GraphQL:**
   - Add header in GraphQL Playground:
     ```
     Authorization: Bearer YOUR_API_KEY_HERE
     ```

## Testing Lead Objects

Once authenticated, you can run GraphQL queries:

### 1. Introspect Lead Type

```graphql
query IntrospectLeadType {
  __type(name: "Lead") {
    name
    kind
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

### 2. Create a Lead

```graphql
mutation CreateLead {
  createLead(
    data: {
      leadNo: "LD-202601-00001"
      customerName: "Test Customer"
      contactNumber: {
        primaryPhoneCountryCode: "+1"
        primaryPhoneNumber: "5551234567"
        primaryPhoneCallingCode: "+1"
      }
      loanAmount: 250000
      locationText: "San Francisco, CA"
    }
  ) {
    id
    leadNo
    customerName
    loanAmount
    createdAt
  }
}
```

### 3. Query Leads

```graphql
query GetLeads {
  leads {
    edges {
      node {
        id
        leadNo
        customerName
        loanAmount
        status
        createdAt
      }
    }
  }
}
```

### 4. Update a Lead

```graphql
mutation UpdateLead {
  updateLead(
    id: "YOUR_LEAD_ID"
    data: {
      status: "In Progress"
      loanAmount: 300000
    }
  ) {
    id
    status
    loanAmount
  }
}
```

### 5. Query Lead with Relations

```graphql
query GetLeadWithRelations {
  lead(filter: { id: { eq: "YOUR_LEAD_ID" } }) {
    id
    customerName
    loanAmount
    
    # Child entities
    properties {
      edges {
        node {
          id
          propertyType
          address
          marketValue
        }
      }
    }
    
    companyParties {
      edges {
        node {
          id
          companyName
          partyRole
        }
      }
    }
    
    # Relations to existing Twenty entities
    attachments {
      edges {
        node {
          id
          name
          fullPath
        }
      }
    }
    
    noteTargets {
      edges {
        node {
          note {
            id
            title
            body
          }
        }
      }
    }
    
    taskTargets {
      edges {
        node {
          task {
            id
            title
            status
          }
        }
      }
    }
  }
}
```

## Why Authentication is Required

Twenty CRM uses a **workspace-scoped architecture** where:

1. **All objects belong to a workspace** - Each workspace has its own isolated data
2. **GraphQL queries need workspace context** - The authentication token identifies which workspace you're querying
3. **Unauthenticated queries return null** - This is by design for security and data isolation

This is why the introspection query `__type(name: "Lead")` returns `null` without authentication - the Lead object exists, but you need to be authenticated with a workspace to access it.

## Troubleshooting

### Issue: "unauthorized" Error

**Solution:** Your token may have expired. Sign in again and get a fresh token.

### Issue: Still Getting Null Results

**Possible causes:**
1. Token not properly set in Authorization header
2. Token format incorrect (should be `Bearer TOKEN`, not just `TOKEN`)
3. Using the wrong GraphQL endpoint (use `/graphql`, not `/metadata`)

### Issue: Can't Access UI at localhost:3000

**Solution:**
1. Ensure the server is running: `npx nx start twenty-server`
2. Check that port 3000 is not in use by another process
3. Wait 30-60 seconds for the server to fully initialize

### Issue: No Workspaces Found

**Solution:** Run database reset with seed data to create test workspaces:
```bash
npx nx database:reset twenty-server
```

## Environment Configuration

Ensure your `.env` file has these settings for local development:

```bash
# Enable prefilled credentials for easy testing
SIGN_IN_PREFILLED=true

# Database connection
PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/default
REDIS_URL=redis://localhost:6379

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

## Additional Resources

- **GraphQL Testing Guide:** `TESTING_QUICK_START.md`
- **Complete Testing Documentation:** `GRAPHQL_SCHEMA_TESTING_GUIDE.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Lead Module README:** `packages/twenty-server/src/modules/lead/README.md`

## Using curl for Testing

If you prefer command-line testing:

```bash
# Get your token first (from UI or create API key)
TOKEN="your_access_token_here"

# Test introspection
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query{__type(name:\"Lead\"){name fields{name}}}"}'

# Create a lead
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"mutation{createLead(data:{leadNo:\"LD-001\",customerName:\"Test\",contactNumber:{primaryPhoneNumber:\"555-1234\"},loanAmount:100000}){id leadNo customerName}}"}'

# Query leads
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query{leads{edges{node{id leadNo customerName loanAmount}}}}"}'
```

## Summary

To authenticate and test Lead objects:

1. ✅ Start server: `npx nx start twenty-server`
2. ✅ Open UI: `http://localhost:3000`
3. ✅ Sign in with prefilled credentials
4. ✅ Get token from browser DevTools
5. ✅ Use token in GraphQL Playground with `Authorization: Bearer TOKEN`
6. ✅ Run Lead queries and mutations

The Lead objects are fully functional - they just require workspace authentication to access!
