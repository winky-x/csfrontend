import { StreamEvent, VerifiedArtifact, ToolApprovalRequest } from '@/types/osint';

/**
 * Validates and updates a tool approval request state
 */
export function processToolApproval(
  current: ToolApprovalRequest,
  decision: 'accepted' | 'rejected'
): ToolApprovalRequest {
  if (current.status !== 'pending') {
    return current;
  }
  return {
    ...current,
    status: decision,
    decided_at: Date.now(),
  };
}

/**
 * Filter or merge newly extracted artifacts into an existing list,
 * enforcing anti-hallucination verification threshold (e.g. >= 0.70 confidence or grounded)
 */
export function aggregateArtifacts(
  existing: VerifiedArtifact[],
  incoming: VerifiedArtifact[],
  confidenceThreshold = 0.65
): VerifiedArtifact[] {
  const merged = [...existing];

  for (const item of incoming) {
    // Only artifacts meeting verification threshold or grounded flags qualify
    if (item.confidence < confidenceThreshold && !item.grounded) {
      continue;
    }

    const index = merged.findIndex(
      (a) => a.identifier.toLowerCase() === item.identifier.toLowerCase() && a.artifact_type === item.artifact_type
    );

    if (index >= 0) {
      // Update with higher confidence / grounded flag
      const existingItem = merged[index];
      merged[index] = {
        ...existingItem,
        confidence: Math.max(existingItem.confidence, item.confidence),
        grounded: existingItem.grounded || item.grounded,
        evidence_snippet: item.evidence_snippet || existingItem.evidence_snippet,
        metadata: { ...existingItem.metadata, ...item.metadata },
      };
    } else {
      merged.push(item);
    }
  }

  return merged;
}

/**
 * Formats a list of stream events and verified artifacts into an exportable markdown dossier
 */
export function generateDossierMarkdown(
  sessionId: string,
  targetQuery: string,
  events: StreamEvent[],
  artifacts: VerifiedArtifact[]
): string {
  const now = new Date().toISOString();
  const reportEvent = events.find((e) => e.event_type === 'report');

  let doc = `# Autonomous CyberOSINT Dossier\n\n`;
  doc += `- **Session ID:** \`${sessionId}\`\n`;
  doc += `- **Generated At:** ${now}\n`;
  doc += `- **Primary Objective / Target:** ${targetQuery}\n`;
  doc += `- **Total Stream Events:** ${events.length}\n`;
  doc += `- **Verified Artifacts Count:** ${artifacts.length}\n\n`;

  doc += `## 1. Verified Intelligence Artifacts\n\n`;
  if (artifacts.length === 0) {
    doc += `*No verified artifacts captured yet.*\n\n`;
  } else {
    doc += `| Type | Identifier | Confidence | Source Tool | Grounded |\n`;
    doc += `| :--- | :--- | :---: | :--- | :---: |\n`;
    for (const a of artifacts) {
      const conf = `${Math.round(a.confidence * 100)}%`;
      const grounded = a.grounded ? '✓ Yes' : '✕ Pending';
      doc += `| **${a.artifact_type.toUpperCase()}** | \`${a.identifier}\` | ${conf} | ${a.source_tool} | ${grounded} |\n`;
    }
    doc += `\n`;
  }

  if (reportEvent && reportEvent.content) {
    doc += `## 2. Final Investigation Summary\n\n`;
    doc += typeof reportEvent.content === 'string'
      ? reportEvent.content
      : JSON.stringify(reportEvent.content, null, 2);
    doc += `\n\n`;
  }

  doc += `## 3. Tool Execution Audit Trail\n\n`;
  const toolEvents = events.filter((e) => e.event_type === 'tool_call' || e.event_type === 'tool_result');
  if (toolEvents.length === 0) {
    doc += `*No external tool executions recorded.*\n\n`;
  } else {
    for (const te of toolEvents) {
      const timestamp = new Date(te.timestamp).toLocaleTimeString();
      doc += `### [${timestamp}] Agent: \`${te.agent_name}\` - Tool: \`${te.tool_name || 'Generic'}\`\n`;
      if (te.tool_args) {
        doc += `\`\`\`json\n${JSON.stringify(te.tool_args, null, 2)}\n\`\`\`\n`;
      }
      if (te.tool_output) {
        doc += `*Result:*\n\`\`\`json\n${JSON.stringify(te.tool_output, null, 2)}\n\`\`\`\n`;
      }
      doc += `\n`;
    }
  }

  return doc;
}
