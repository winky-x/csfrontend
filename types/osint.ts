export type EventType = 
  | 'thought' 
  | 'tool_call' 
  | 'tool_result' 
  | 'agent_handoff' 
  | 'report' 
  | 'error';

export type AgentName = 'Coordinator' | 'SocialSubAgent' | 'InfraAgent' | 'GeoAgent';

export interface ToolApprovalRequest {
  tool_id: string;
  tool_name: string;
  target: string;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  reason: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'accepted' | 'rejected';
  requested_at: number;
  decided_at?: number;
}

export interface StreamEvent {
  id: string;
  event_type: EventType;
  agent_name: AgentName | string;
  content: any;
  timestamp: number;
  tool_name?: string;
  tool_args?: Record<string, unknown>;
  tool_output?: any;
  approval?: ToolApprovalRequest;
  handoff_from?: string;
  handoff_to?: string;
  handoff_reason?: string;
  is_streaming?: boolean;
}

export interface VerifiedArtifact {
  id: string;
  artifact_type: 'profile' | 'infrastructure' | 'location' | 'credential';
  identifier: string; // e.g. "@dave_atx", "192.168.1.1", "MetroFlex Austin"
  confidence: number; // 0.0 to 1.0
  source_tool: string;
  grounded: boolean;
  evidence_snippet: string;
  metadata?: Record<string, any>;
  discovered_by?: string;
  timestamp: number;
}

export interface InvestigationScenario {
  id: string;
  title: string;
  shortLabel: string;
  prompt: string;
  targetType: string;
  sampleImage?: string;
  imageCaption?: string;
}
