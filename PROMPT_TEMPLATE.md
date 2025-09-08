# How to Use Session Management in Your Agent Prompts

## Setup in Your Prompt

```javascript
const SimpleSessionManager = require('./simple-session');
const sessions = new SimpleSessionManager('./sessions');
```

## Prompt Flow with Session Updates

### PROMPT 1: Initialize Process
```
You are a Process Architect agent. 
A user has uploaded document: {filename}

ACTIONS:
1. Create a session to track this workflow
2. Analyze the document for subprocesses
3. Store the results in the session

CODE TO RUN:
```javascript
// Create session
const session = await sessions.create(userId, {
  session_metadata: {
    status: 'initializing',
    created_at: new Date().toISOString()
  },
  document_info: {
    filename: documentName,
    type: 'procedural_guide'
  },
  analysis: {
    detected_subprocesses: []
  }
});

// After analysis, update session
await sessions.update(session.id, {
  session_metadata: { status: 'analyzing' },
  analysis: {
    detected_subprocesses: [
      { id: '1', name: 'customer_onboarding' },
      { id: '2', name: 'account_activation' }
    ]
  }
});
```

### PROMPT 2: User Approval
```
Show the detected subprocesses to user and get approval.

ACTIONS:
1. Load current session
2. Display subprocesses from session.data.analysis.detected_subprocesses
3. Update session with approval status

CODE TO RUN:
```javascript
// Get session
const session = await sessions.get(sessionId);

// Show subprocesses to user
const subprocesses = session.data.analysis.detected_subprocesses;
console.log('Found subprocesses:', subprocesses);

// After user approves, update
await sessions.update(sessionId, {
  session_metadata: { status: 'processing' },
  orchestration: {
    subprocess_registry: {
      approved: ['1', '2'],
      queued: ['1', '2'],
      in_progress: '1'
    }
  }
});
```

### PROMPT 3: Process Implementation
```
You are a Process Analyst agent.
Implement the BPMN for subprocess from the queue.

ACTIONS:
1. Load session to get next subprocess
2. Implement the BPMN diagram
3. Update session with implementation details

CODE TO RUN:
```javascript
// Get session and next subprocess
const session = await sessions.get(sessionId);
const nextSubprocess = session.data.orchestration.subprocess_registry.in_progress;

// After implementation
await sessions.update(sessionId, {
  implementation: {
    subprocess_implementations: [{
      subprocess_id: nextSubprocess,
      status: 'completed',
      bpmn_file: `subprocess_${nextSubprocess}.bpmn`,
      completed_at: new Date().toISOString()
    }]
  },
  orchestration: {
    subprocess_registry: {
      in_progress: null,
      completed: [nextSubprocess]
    }
  }
});
```

### PROMPT 4: Quality Check
```
You are a QA Gatekeeper agent.
Check the implemented subprocess.

ACTIONS:
1. Load session to get implementation details
2. Perform quality checks
3. Update session with QA results

CODE TO RUN:
```javascript
// Get implementation to check
const session = await sessions.get(sessionId);
const implementation = session.data.implementation.subprocess_implementations[0];

// After QA check
await sessions.update(sessionId, {
  quality_assurance: {
    qa_results: [{
      subprocess_id: implementation.subprocess_id,
      verdict: 'pass',
      checked_at: new Date().toISOString()
    }]
  }
});
```

### PROMPT 5: Check Progress
```
Check overall progress of the workflow.

CODE TO RUN:
```javascript
const session = await sessions.get(sessionId);

console.log('Status:', session.data.session_metadata.status);
console.log('Completed:', session.data.orchestration.subprocess_registry.completed);
console.log('Remaining:', session.data.orchestration.subprocess_registry.queued);
```

## Complete Example in Single Prompt

```
You are an orchestration agent managing a BPMN workflow.

For each step in the workflow:
1. Load the current session state
2. Perform the step's actions
3. Update the session with results
4. Save before moving to next step

Here's your workflow:

```javascript
const SimpleSessionManager = require('./simple-session');
const sessions = new SimpleSessionManager('./sessions');

async function runWorkflow(userId, documentName) {
  // Step 1: Initialize
  console.log('Step 1: Initializing...');
  const session = await sessions.create(userId, {
    status: 'initializing',
    document: documentName,
    subprocesses: [],
    completed: []
  });
  
  // Step 2: Analysis
  console.log('Step 2: Analyzing document...');
  await sessions.update(session.id, {
    status: 'analyzing',
    subprocesses: ['customer_onboarding', 'account_activation']
  });
  
  // Step 3: Process each subprocess
  const current = await sessions.get(session.id);
  for (const subprocess of current.data.subprocesses) {
    console.log(`Step 3: Processing ${subprocess}...`);
    
    // Update: mark as in progress
    await sessions.update(session.id, {
      status: 'processing',
      current_subprocess: subprocess
    });
    
    // Do the work...
    // Create BPMN, validate, etc.
    
    // Update: mark as completed
    const latest = await sessions.get(session.id);
    await sessions.update(session.id, {
      completed: [...latest.data.completed, subprocess],
      current_subprocess: null
    });
  }
  
  // Step 4: Finalize
  console.log('Step 4: Finalizing...');
  await sessions.update(session.id, {
    status: 'completed',
    completed_at: new Date().toISOString()
  });
  
  return session.id;
}

// Run the workflow
const sessionId = await runWorkflow('user_001', 'process.docx');
console.log('Workflow completed. Session:', sessionId);
```

## Key Points for Prompting

1. **Always load session first** before making decisions:
   ```javascript
   const session = await sessions.get(sessionId);
   const currentState = session.data;
   ```

2. **Update after each significant step**:
   ```javascript
   await sessions.update(sessionId, {
     step_completed: true,
     next_step: 'qa_check'
   });
   ```

3. **Use session to maintain context between prompts**:
   - Store what's been done
   - Track what's pending
   - Record decisions made
   - Keep audit trail

4. **Structure your updates to match your workflow**:
   - Each agent updates their section
   - Controller tracks overall progress
   - Events record everything

## Session File Location

All sessions are stored as JSON files in:
```
./sessions/{session-id}.json
```

You can manually inspect them anytime to see the full state.