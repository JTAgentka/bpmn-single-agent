// DIRECT APPROACH - Agent just reads/writes the exact JSON structure

// In your prompt:
// "Load the session file and update the analysis section"
const fs = require('fs').promises;

async function directApproach() {
  console.log('=== DIRECT APPROACH ===\n');
  
  // Step 1: Agent loads the exact JSON structure
  console.log('PROMPT: "Load consolidated_session.json and update analysis.status to completed"');
  
  const sessionData = JSON.parse(
    await fs.readFile('./tool/consolidated_session_structure.json', 'utf8')
  );
  
  // Step 2: Agent directly modifies the structure
  sessionData.analysis.architect.status = 'completed';
  sessionData.analysis.architect.detected_subprocesses.push({
    id: '4',
    name: 'new_subprocess'
  });
  
  // Step 3: Agent saves it back
  await fs.writeFile(
    './consolidated_session.json',
    JSON.stringify(sessionData, null, 2)
  );
  
  console.log('✓ Agent directly modified the JSON file\n');
  console.log('Pros:');
  console.log('- No code needed, agent just follows instructions');
  console.log('- You control exact structure in prompt');
  console.log('- Agent can see/modify entire structure at once');
  console.log('- Works with ANY structure you define\n');
  
  console.log('Cons:');
  console.log('- Agent might break JSON structure');
  console.log('- No validation or error handling');
  console.log('- Agent needs to understand entire structure');
  console.log('- More tokens used in prompts to specify paths');
}

// WRAPPER APPROACH - Using the session manager
async function wrapperApproach() {
  console.log('\n=== WRAPPER APPROACH (Session Manager) ===\n');
  
  const SimpleSessionManager = require('./simple-session');
  const sessions = new SimpleSessionManager();
  
  console.log('PROMPT: "Update the analysis status to completed"');
  
  // Agent uses simple commands
  const session = await sessions.create('user123', {
    analysis: { status: 'not_started' }
  });
  
  await sessions.update(session.id, {
    analysis: { status: 'completed' }
  });
  
  console.log('✓ Agent used session manager methods\n');
  console.log('Pros:');
  console.log('- Validation and error handling built-in');
  console.log('- Agent can\'t break the structure');
  console.log('- Simpler commands in prompts');
  console.log('- Automatic ID generation, timestamps, etc.\n');
  
  console.log('Cons:');
  console.log('- Need to maintain the wrapper code');
  console.log('- Less flexible for arbitrary structures');
  console.log('- Agent needs to learn the API');
  console.log('- Extra abstraction layer');
}

async function comparison() {
  await directApproach();
  await wrapperApproach();
  
  console.log('\n=== KEY DIFFERENCE ===\n');
  console.log('DIRECT: You tell agent exact JSON paths to modify');
  console.log('Example prompt:');
  console.log('  "Set session.analysis.architect.status = completed"');
  console.log('  "Add subprocess to session.analysis.architect.detected_subprocesses[]"');
  console.log('');
  console.log('WRAPPER: You tell agent what to do conceptually');  
  console.log('Example prompt:');
  console.log('  "Mark analysis as completed"');
  console.log('  "Add the new subprocess to the session"');
}

comparison().catch(console.error);