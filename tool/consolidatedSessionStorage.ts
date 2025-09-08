import { tool } from '@openai/agents/realtime';

// Consolidated Session Structure Interface
interface ConsolidatedSession {
  session_metadata: {
    session_id: string;
    version: string;
    created_at: string;
    updated_at: string;
    status: 'initializing' | 'analyzing' | 'processing' | 'quality_check' | 'completed' | 'error';
  };
  
  user_context: {
    user_id: string;
    display_name: string;
    locale: string;
    organization?: string;
    role?: string;
  };
  
  document_info: {
    filename: string;
    version: string;
    type: 'procedural_guide' | 'regulation' | 'manual' | 'other';
    ingested_at: string;
    checksum_sha256: string;
    source_system?: string;
    classification?: string;
  };
  
  orchestration: {
    controller: {
      session_ref: string;
      control_state: string;
      subprocess_registry: {
        total: number;
        approved: number;
        queued: string[];
        in_progress: string | null;
        completed: string[];
        rejected: string[];
      };
      user_prompts: Record<string, boolean>;
      agent_references: Record<string, string>;
    };
  };
  
  analysis: {
    architect: {
      session_ref: string;
      status: string;
      criteria_examples: Record<string, string[]>;
      analysis_notes: string;
      detected_subprocesses: Array<any>;
    };
  };
  
  implementation: {
    analyst: {
      session_ref: string;
      status: string;
      current_subprocess: string | null;
      queue: string[];
      subprocess_implementations: Array<any>;
    };
  };
  
  quality_assurance: {
    gatekeeper: {
      session_ref: string;
      status: string;
      qa_scope: Record<string, any>;
      qa_results: Array<any>;
      summary_metrics: Record<string, any>;
    };
  };
  
  execution_history: {
    events: Array<{
      timestamp: string;
      agent: string;
      action: string;
      details: string;
      subprocess_id: string | null;
    }>;
    state_transitions: Array<{
      timestamp: string;
      from_state: string;
      to_state: string;
      trigger: string;
    }>;
  };
  
  performance_metrics: {
    timing: Record<string, number>;
    quality: Record<string, any>;
    throughput: Record<string, number>;
  };
  
  audit_trail: {
    session_files: string[];
    audit_logs: string[];
    generated_artifacts: string[];
  };
}

// Factory function to create initial consolidated session
function createInitialConsolidatedSession(sessionId: string): ConsolidatedSession {
  const now = new Date().toISOString();
  
  return {
    session_metadata: {
      session_id: sessionId,
      version: '1.0',
      created_at: now,
      updated_at: now,
      status: 'initializing'
    },
    
    user_context: {
      user_id: 'user_001',
      display_name: 'User',
      locale: 'en-US'
    },
    
    document_info: {
      filename: '',
      version: '1.0',
      type: 'other',
      ingested_at: now,
      checksum_sha256: ''
    },
    
    orchestration: {
      controller: {
        session_ref: `${sessionId}_interactive_controller`,
        control_state: 'idle',
        subprocess_registry: {
          total: 0,
          approved: 0,
          queued: [],
          in_progress: null,
          completed: [],
          rejected: []
        },
        user_prompts: {},
        agent_references: {
          architect: `${sessionId}_process_architect`,
          analyst: `${sessionId}_process_analyst`,
          qa_gatekeeper: `${sessionId}_process_quality_gatekeeper`
        }
      }
    },
    
    analysis: {
      architect: {
        session_ref: `${sessionId}_process_architect`,
        status: 'not_started',
        criteria_examples: {
          structural: [],
          semantic: [],
          business_logic: []
        },
        analysis_notes: '',
        detected_subprocesses: []
      }
    },
    
    implementation: {
      analyst: {
        session_ref: `${sessionId}_process_analyst`,
        status: 'idle',
        current_subprocess: null,
        queue: [],
        subprocess_implementations: []
      }
    },
    
    quality_assurance: {
      gatekeeper: {
        session_ref: `${sessionId}_process_quality_gatekeeper`,
        status: 'not_started',
        qa_scope: {
          subprocess_ids: [],
          total_count: 0,
          checked_count: 0,
          pending_count: 0
        },
        qa_results: [],
        summary_metrics: {
          total_subprocesses: 0,
          passed: 0,
          failed: 0,
          needs_fix: 0,
          pending_review: 0,
          average_quality_score: 0
        }
      }
    },
    
    execution_history: {
      events: [
        {
          timestamp: now,
          agent: 'system',
          action: 'session_initialized',
          details: 'Consolidated session created',
          subprocess_id: null
        }
      ],
      state_transitions: [
        {
          timestamp: now,
          from_state: 'not_started',
          to_state: 'initializing',
          trigger: 'session_create'
        }
      ]
    },
    
    performance_metrics: {
      timing: {
        total_elapsed_time_minutes: 0,
        average_subprocess_time_minutes: 0,
        analysis_phase_minutes: 0,
        implementation_phase_minutes: 0,
        qa_phase_minutes: 0
      },
      quality: {
        first_pass_success_rate: 0,
        rework_required: false,
        user_interventions: 0,
        automated_steps: 0
      },
      throughput: {
        subprocesses_completed: 0,
        subprocesses_in_progress: 0,
        subprocesses_queued: 0
      }
    },
    
    audit_trail: {
      session_files: [],
      audit_logs: [],
      generated_artifacts: []
    }
  };
}

// Helper function to update nested properties using dot notation
function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Helper function to get nested property using dot notation
function getNestedProperty(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

// Consolidated session storage tool
export const consolidatedSessionStorage = tool({
  name: 'consolidated_session_storage',
  description: 'Manage consolidated session data containing all agent states in a single file',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['load', 'save', 'update', 'add_event', 'update_metrics'],
        description: 'Action to perform on consolidated session'
      },
      sessionId: {
        type: 'string',
        description: 'Session identifier'
      },
      data: {
        type: 'object',
        description: 'Data to save or update'
      },
      updatePath: {
        type: 'string',
        description: 'Dot-notation path for updates (e.g., "orchestration.controller.control_state")'
      },
      event: {
        type: 'object',
        description: 'Event to add to execution history',
        properties: {
          agent: { type: 'string' },
          action: { type: 'string' },
          details: { type: 'string' },
          subprocess_id: { type: 'string' }
        }
      }
    },
    required: ['action', 'sessionId'],
    additionalProperties: false
  },
  execute: async (input: any) => {
    try {
      const { action, sessionId, data, updatePath, event } = input;
      const fileName = `${sessionId}_consolidated.json`;
      
      switch (action) {
        case 'load': {
          try {
            const response = await fetch(`/api/consolidated-storage?file=${fileName}`);
            if (response.ok) {
              const sessionData = await response.json();
              return {
                success: true,
                message: 'Consolidated session loaded',
                data: sessionData
              };
            } else {
              // Create new consolidated session
              const newSession = createInitialConsolidatedSession(sessionId);
              return {
                success: true,
                message: 'New consolidated session created',
                data: newSession
              };
            }
          } catch (error) {
            return {
              success: false,
              message: `Error loading consolidated session: ${error}`,
              data: null
            };
          }
        }
        
        case 'save': {
          if (!data) {
            return {
              success: false,
              message: 'No data provided to save',
              data: null
            };
          }
          
          // Update timestamp
          data.session_metadata = data.session_metadata || {};
          data.session_metadata.updated_at = new Date().toISOString();
          
          const response = await fetch('/api/consolidated-storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: fileName,
              data: data
            })
          });
          
          if (response.ok) {
            return {
              success: true,
              message: 'Consolidated session saved',
              data: data
            };
          } else {
            return {
              success: false,
              message: 'Failed to save consolidated session',
              data: null
            };
          }
        }
        
        case 'update': {
          // Load existing session
          const loadResponse = await fetch(`/api/consolidated-storage?file=${fileName}`);
          let existingData: ConsolidatedSession;
          
          if (loadResponse.ok) {
            existingData = await loadResponse.json();
          } else {
            existingData = createInitialConsolidatedSession(sessionId);
          }
          
          // Apply update
          if (updatePath && data) {
            setNestedProperty(existingData, updatePath, data);
          } else if (data) {
            // Merge at root level
            existingData = { ...existingData, ...data };
          }
          
          // Update timestamp
          existingData.session_metadata.updated_at = new Date().toISOString();
          
          // Save updated session
          const saveResponse = await fetch('/api/consolidated-storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: fileName,
              data: existingData
            })
          });
          
          if (saveResponse.ok) {
            return {
              success: true,
              message: 'Consolidated session updated',
              data: existingData
            };
          } else {
            return {
              success: false,
              message: 'Failed to update consolidated session',
              data: null
            };
          }
        }
        
        case 'add_event': {
          if (!event) {
            return {
              success: false,
              message: 'No event provided',
              data: null
            };
          }
          
          // Load existing session
          const loadResponse = await fetch(`/api/consolidated-storage?file=${fileName}`);
          let existingData: ConsolidatedSession;
          
          if (loadResponse.ok) {
            existingData = await loadResponse.json();
          } else {
            existingData = createInitialConsolidatedSession(sessionId);
          }
          
          // Add event to history
          const newEvent = {
            timestamp: new Date().toISOString(),
            agent: event.agent,
            action: event.action,
            details: event.details,
            subprocess_id: event.subprocess_id || null
          };
          
          existingData.execution_history.events.push(newEvent);
          existingData.session_metadata.updated_at = new Date().toISOString();
          
          // Save updated session
          const saveResponse = await fetch('/api/consolidated-storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: fileName,
              data: existingData
            })
          });
          
          if (saveResponse.ok) {
            return {
              success: true,
              message: 'Event added to consolidated session',
              data: existingData
            };
          } else {
            return {
              success: false,
              message: 'Failed to add event',
              data: null
            };
          }
        }
        
        case 'update_metrics': {
          // Load existing session
          const loadResponse = await fetch(`/api/consolidated-storage?file=${fileName}`);
          let existingData: ConsolidatedSession;
          
          if (loadResponse.ok) {
            existingData = await loadResponse.json();
          } else {
            existingData = createInitialConsolidatedSession(sessionId);
          }
          
          // Calculate and update metrics
          const startTime = new Date(existingData.session_metadata.created_at).getTime();
          const currentTime = new Date().getTime();
          const elapsedMinutes = Math.floor((currentTime - startTime) / 60000);
          
          existingData.performance_metrics.timing.total_elapsed_time_minutes = elapsedMinutes;
          existingData.performance_metrics.throughput.subprocesses_completed = 
            existingData.orchestration.controller.subprocess_registry.completed.length;
          existingData.performance_metrics.throughput.subprocesses_queued = 
            existingData.orchestration.controller.subprocess_registry.queued.length;
          
          existingData.session_metadata.updated_at = new Date().toISOString();
          
          // Save updated session
          const saveResponse = await fetch('/api/consolidated-storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: fileName,
              data: existingData
            })
          });
          
          if (saveResponse.ok) {
            return {
              success: true,
              message: 'Metrics updated in consolidated session',
              data: existingData
            };
          } else {
            return {
              success: false,
              message: 'Failed to update metrics',
              data: null
            };
          }
        }
        
        default:
          return {
            success: false,
            message: `Unknown action: ${action}`,
            data: null
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error in consolidated session storage: ${error}`,
        data: null
      };
    }
  }
});