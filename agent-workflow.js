const SimpleSessionManager = require('./simple-session');

/**
 * Example of using session manager in a multi-step agent workflow
 * This shows how to update the session after each step in your BPMN process
 */

class AgentWorkflow {
  constructor() {
    this.sessions = new SimpleSessionManager('./sessions');
    this.currentSession = null;
  }

  // Step 1: Initialize session when document is uploaded
  async initializeSession(userId, documentInfo) {
    console.log('\n=== STEP 1: Initialize Session ===');
    
    // Create session with initial structure (matching your consolidated_session_structure.json)
    this.currentSession = await this.sessions.create(userId, {
      session_metadata: {
        session_id: `session_${Date.now()}`,
        version: '1.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'initializing'
      },
      document_info: documentInfo,
      orchestration: {
        controller: {
          control_state: 'idle',
          subprocess_registry: {
            total: 0,
            approved: 0,
            queued: [],
            in_progress: null,
            completed: []
          }
        }
      },
      analysis: {
        architect: {
          status: 'not_started',
          detected_subprocesses: []
        }
      },
      execution_history: {
        events: [{
          timestamp: new Date().toISOString(),
          agent: 'system',
          action: 'session_initialized',
          details: 'Session created'
        }]
      }
    });
    
    console.log(`Session created: ${this.currentSession.id}`);
    return this.currentSession;
  }

  // Step 2: After architect analyzes document
  async updateAfterAnalysis(subprocesses) {
    console.log('\n=== STEP 2: Update After Analysis ===');
    
    const session = await this.sessions.get(this.currentSession.id);
    
    // Update analysis section
    session.data.analysis.architect.status = 'completed';
    session.data.analysis.architect.detected_subprocesses = subprocesses;
    session.data.orchestration.controller.subprocess_registry.total = subprocesses.length;
    session.data.session_metadata.status = 'analyzing';
    
    // Add event to history
    session.data.execution_history.events.push({
      timestamp: new Date().toISOString(),
      agent: 'process_architect',
      action: 'subprocesses_identified',
      details: `Found ${subprocesses.length} subprocesses`
    });
    
    await this.sessions.update(this.currentSession.id, session.data);
    console.log(`Updated: Found ${subprocesses.length} subprocesses`);
  }

  // Step 3: After user approves subprocesses
  async updateAfterApproval(approvedIds) {
    console.log('\n=== STEP 3: Update After Approval ===');
    
    const session = await this.sessions.get(this.currentSession.id);
    
    // Update orchestration
    session.data.orchestration.controller.subprocess_registry.approved = approvedIds.length;
    session.data.orchestration.controller.subprocess_registry.queued = approvedIds;
    session.data.session_metadata.status = 'processing';
    
    // Mark subprocesses as approved
    session.data.analysis.architect.detected_subprocesses.forEach(sp => {
      if (approvedIds.includes(sp.id)) {
        sp.status = 'approved';
        sp.approval = {
          approved_by: session.userId,
          approved_at: new Date().toISOString()
        };
      }
    });
    
    // Add event
    session.data.execution_history.events.push({
      timestamp: new Date().toISOString(),
      agent: 'user',
      action: 'subprocesses_approved',
      details: `Approved ${approvedIds.length} subprocesses`
    });
    
    await this.sessions.update(this.currentSession.id, session.data);
    console.log(`Updated: Approved ${approvedIds.length} subprocesses`);
  }

  // Step 4: After analyst processes a subprocess
  async updateAfterImplementation(subprocessId, implementation) {
    console.log(`\n=== STEP 4: Update After Implementation (subprocess ${subprocessId}) ===`);
    
    const session = await this.sessions.get(this.currentSession.id);
    
    // Initialize implementation section if needed
    if (!session.data.implementation) {
      session.data.implementation = {
        analyst: {
          status: 'processing',
          subprocess_implementations: []
        }
      };
    }
    
    // Add implementation details
    session.data.implementation.analyst.subprocess_implementations.push({
      subprocess_id: subprocessId,
      subprocess_name: implementation.name,
      implementation_status: 'completed',
      building_blocks: implementation.building_blocks,
      actor_mapping: implementation.actor_mapping,
      bpmn_generation: implementation.bpmn_generation
    });
    
    // Update registry
    const registry = session.data.orchestration.controller.subprocess_registry;
    registry.in_progress = null;
    registry.completed.push(subprocessId);
    registry.queued = registry.queued.filter(id => id !== subprocessId);
    
    // Add event
    session.data.execution_history.events.push({
      timestamp: new Date().toISOString(),
      agent: 'process_analyst',
      action: 'subprocess_implemented',
      details: `Completed implementation of subprocess ${subprocessId}`
    });
    
    await this.sessions.update(this.currentSession.id, session.data);
    console.log(`Updated: Implemented subprocess ${subprocessId}`);
  }

  // Step 5: After QA check
  async updateAfterQA(subprocessId, qaResult) {
    console.log(`\n=== STEP 5: Update After QA (subprocess ${subprocessId}) ===`);
    
    const session = await this.sessions.get(this.currentSession.id);
    
    // Initialize QA section if needed
    if (!session.data.quality_assurance) {
      session.data.quality_assurance = {
        gatekeeper: {
          status: 'in_progress',
          qa_results: []
        }
      };
    }
    
    // Add QA result
    session.data.quality_assurance.gatekeeper.qa_results.push({
      subprocess_id: subprocessId,
      checked_at: new Date().toISOString(),
      final_assessment: qaResult
    });
    
    // Add event
    session.data.execution_history.events.push({
      timestamp: new Date().toISOString(),
      agent: 'process_quality_gatekeeper',
      action: 'qa_completed',
      details: `QA ${qaResult.verdict} for subprocess ${subprocessId}`
    });
    
    await this.sessions.update(this.currentSession.id, session.data);
    console.log(`Updated: QA ${qaResult.verdict} for subprocess ${subprocessId}`);
  }

  // Helper: Get current session state
  async getSessionState() {
    const session = await this.sessions.get(this.currentSession.id);
    return {
      status: session.data.session_metadata.status,
      subprocesses: {
        total: session.data.orchestration.controller.subprocess_registry.total,
        completed: session.data.orchestration.controller.subprocess_registry.completed.length,
        queued: session.data.orchestration.controller.subprocess_registry.queued.length
      },
      events: session.data.execution_history.events.length
    };
  }
}

// Example usage in your prompt workflow
async function runWorkflowExample() {
  const workflow = new AgentWorkflow();
  
  // PROMPT STEP 1: "Upload document for analysis"
  await workflow.initializeSession('user_001', {
    filename: 'business_process.docx',
    type: 'procedural_guide',
    ingested_at: new Date().toISOString()
  });
  
  // PROMPT STEP 2: "Architect analyzes document"
  await workflow.updateAfterAnalysis([
    { id: '1', name: 'customer_onboarding', category: 'activation' },
    { id: '2', name: 'account_activation', category: 'activation' },
    { id: '3', name: 'service_provisioning', category: 'operation' }
  ]);
  
  // PROMPT STEP 3: "User approves subprocesses"
  await workflow.updateAfterApproval(['1', '2']);
  
  // PROMPT STEP 4: "Analyst implements subprocess 1"
  await workflow.updateAfterImplementation('1', {
    name: 'customer_onboarding',
    building_blocks: { status: 'approved', mapping: {} },
    actor_mapping: { status: 'approved', lanes: {} },
    bpmn_generation: { status: 'approved', file: 'customer_onboarding.bpmn' }
  });
  
  // PROMPT STEP 5: "QA checks subprocess 1"
  await workflow.updateAfterQA('1', {
    verdict: 'pass',
    risk_level: 'low'
  });
  
  // Check current state
  const state = await workflow.getSessionState();
  console.log('\n=== Current Session State ===');
  console.log(state);
  
  // Get full session for inspection
  const fullSession = await workflow.sessions.get(workflow.currentSession.id);
  console.log('\n=== Full Session Data ===');
  console.log(JSON.stringify(fullSession.data, null, 2));
}

// Export for use in prompts
module.exports = AgentWorkflow;

// Run example if called directly
if (require.main === module) {
  runWorkflowExample().catch(console.error);
}