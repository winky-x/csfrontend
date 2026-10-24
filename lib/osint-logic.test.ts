import test from 'node:test';
import assert from 'node:assert/strict';
import { processToolApproval, aggregateArtifacts, generateDossierMarkdown } from './osint-logic';
import { ToolApprovalRequest, VerifiedArtifact, StreamEvent } from '@/types/osint';

test('processToolApproval accepts a pending request', () => {
  const req: ToolApprovalRequest = {
    tool_id: 'tool-1',
    tool_name: 'nmap_port_scan',
    target: '192.168.1.1',
    risk_level: 'high',
    reason: 'Active network port interrogation',
    parameters: { port_range: '1-1024' },
    status: 'pending',
    requested_at: 1000,
  };

  const accepted = processToolApproval(req, 'accepted');
  assert.equal(accepted.status, 'accepted');
  assert.ok(accepted.decided_at && accepted.decided_at >= 1000);
});

test('processToolApproval rejects a pending request', () => {
  const req: ToolApprovalRequest = {
    tool_id: 'tool-2',
    tool_name: 'leak_db_dump',
    target: 'victim@target.com',
    risk_level: 'critical',
    reason: 'Breach database password search',
    parameters: {},
    status: 'pending',
    requested_at: 1000,
  };

  const rejected = processToolApproval(req, 'rejected');
  assert.equal(rejected.status, 'rejected');
  assert.ok(rejected.decided_at);
});

test('aggregateArtifacts deduplicates and enriches artifacts', () => {
  const existing: VerifiedArtifact[] = [
    {
      id: 'a1',
      artifact_type: 'profile',
      identifier: '@target_dev',
      confidence: 0.75,
      source_tool: 'sherlock',
      grounded: true,
      evidence_snippet: 'Found on GitHub',
      timestamp: 1000,
    },
  ];

  const incoming: VerifiedArtifact[] = [
    {
      id: 'a2',
      artifact_type: 'profile',
      identifier: '@target_dev',
      confidence: 0.92,
      source_tool: 'twitter_osint',
      grounded: true,
      evidence_snippet: 'Matched bio and public key',
      timestamp: 2000,
    },
    {
      id: 'a3',
      artifact_type: 'infrastructure',
      identifier: '104.24.11.2',
      confidence: 0.88,
      source_tool: 'shodan_lookup',
      grounded: true,
      evidence_snippet: 'Reverse DNS verified',
      timestamp: 2000,
    },
    {
      id: 'a4',
      artifact_type: 'credential',
      identifier: 'unverified_leak',
      confidence: 0.40, // Below threshold and not grounded
      source_tool: 'pastebin_search',
      grounded: false,
      evidence_snippet: 'Low confidence match',
      timestamp: 2000,
    },
  ];

  const result = aggregateArtifacts(existing, incoming);
  assert.equal(result.length, 2); // a4 excluded, a1 and a2 merged
  const devProfile = result.find((a) => a.identifier === '@target_dev');
  assert.ok(devProfile);
  assert.equal(devProfile?.confidence, 0.92);
  assert.equal(devProfile?.evidence_snippet, 'Matched bio and public key');
});

test('generateDossierMarkdown formats summary report correctly', () => {
  const events: StreamEvent[] = [
    {
      id: 'e1',
      event_type: 'report',
      agent_name: 'Coordinator',
      content: 'Target confirmed at MetroFlex Austin.',
      timestamp: 1000,
    },
  ];
  const artifacts: VerifiedArtifact[] = [
    {
      id: 'a1',
      artifact_type: 'location',
      identifier: 'MetroFlex Gym Austin',
      confidence: 0.95,
      source_tool: 'exiftool_geotag',
      grounded: true,
      evidence_snippet: 'GPS EXIF match',
      timestamp: 1000,
    },
  ];

  const doc = generateDossierMarkdown('session-123', 'Investigate gym photo', events, artifacts);
  assert.ok(doc.includes('# Autonomous CyberOSINT Dossier'));
  assert.ok(doc.includes('session-123'));
  assert.ok(doc.includes('MetroFlex Gym Austin'));
  assert.ok(doc.includes('Target confirmed at MetroFlex Austin.'));
});
