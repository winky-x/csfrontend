import { InvestigationScenario, StreamEvent, VerifiedArtifact } from '@/types/osint';

export const BENCHMARK_SCENARIOS: InvestigationScenario[] = [
  {
    id: 'scenario-gym-imint',
    title: 'Scenario 1: Gym IMINT -> Person Pivot',
    shortLabel: 'Gym IMINT -> Person Pivot',
    targetType: 'IMINT / Geospatial / Social Graph',
    sampleImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    imageCaption: 'Target gym photograph with equipment branding, gym logo reflection & window skyline',
    prompt: 'Analyze target fitness center photo: extract geo-coordinates, match equipment brand "Hammer Strength" & neon gym signage, pivot to social media check-ins, identify user @dave_power_atx and map physical schedule.',
  },
  {
    id: 'scenario-social-resolution',
    title: 'Scenario 2: Private Social Account Resolution',
    shortLabel: 'Private Social Account Resolution',
    targetType: 'Social Identity / Alias Correlation / Breach Pivot',
    prompt: 'Target alias "shadow_vector_99" with private Instagram & Telegram. Perform username cross-correlation across 500+ forums, extract linked PGP key ID, identify recovery email substring d***@proton.me, and correlate GitHub commits to uncover real identity.',
  },
  {
    id: 'scenario-domain-attack-surface',
    title: 'Scenario 3: Domain Attack Surface Mapping',
    shortLabel: 'Domain Attack Surface Mapping',
    targetType: 'External Recon / Infrastructure / ASN Correlation',
    prompt: 'Map external attack surface for apex target apex-sec-defense.io: enumerate subdomains via Certificate Transparency logs, identify dangling DNS records, correlate Shodan banner fingerprints, and flag exposed internal staging Jenkins cluster.',
  },
];

export interface ScenarioSimulationData {
  events: StreamEvent[];
  artifacts: VerifiedArtifact[];
  activeAgentSequence: string[];
}

export function getScenarioSimulation(scenarioId: string, customPrompt?: string): ScenarioSimulationData {
  const timestamp = Date.now();

  if (scenarioId === 'scenario-domain-attack-surface') {
    return {
      activeAgentSequence: ['Coordinator', 'InfraAgent', 'Coordinator'],
      events: [
        {
          id: 'ev-1',
          event_type: 'thought',
          agent_name: 'Coordinator',
          timestamp: timestamp + 200,
          content: {
            title: 'Triage & Attack Surface Strategy',
            steps: [
              {
                label: 'Parse Domain Scope',
                desc: 'Target identified: apex-sec-defense.io. Validating TLD registry and root DNS NS records.',
                status: 'complete',
              },
              {
                label: 'Enumerate Subdomains via Passive CT Logs',
                desc: 'Querying crt.sh and Certspotter to avoid active DNS traffic alerting blue team.',
                status: 'complete',
              },
              {
                label: 'Delegating Infrastructure Reconnaissance',
                desc: 'Handing off active port scanning and IP block correlation to InfraAgent.',
                status: 'active',
              },
            ],
          },
        },
        {
          id: 'ev-2',
          event_type: 'agent_handoff',
          agent_name: 'Coordinator',
          timestamp: timestamp + 800,
          content: 'Coordinator handing off external reconnaissance tasks to InfraAgent',
          handoff_from: 'Master Coordinator',
          handoff_to: 'InfraAgent',
          handoff_reason: 'Execute deep passive CT parsing & DNS brute force across apex-sec-defense.io',
        },
        {
          id: 'ev-3',
          event_type: 'tool_call',
          agent_name: 'InfraAgent',
          tool_name: 'subfinder_passive_enum',
          tool_args: { domain: 'apex-sec-defense.io', sources: ['crt.sh', 'shodan', 'threatminer'] },
          timestamp: timestamp + 1400,
          content: 'Querying passive reconnaissance sources for apex-sec-defense.io',
        },
        {
          id: 'ev-4',
          event_type: 'tool_result',
          agent_name: 'InfraAgent',
          tool_name: 'subfinder_passive_enum',
          timestamp: timestamp + 2000,
          content: 'Discovered 4 live subdomains with active A records',
          tool_output: {
            discovered_hosts: [
              { host: 'vpn.apex-sec-defense.io', ip: '104.24.11.2', status: 200 },
              { host: 'api-internal.apex-sec-defense.io', ip: '104.24.11.8', status: 403 },
              { host: 'jenkins-staging.apex-sec-defense.io', ip: '172.67.182.44', status: 200 },
              { host: 'auth.apex-sec-defense.io', ip: '104.24.11.19', status: 200 },
            ],
            total_discovered: 4,
          },
        },
        {
          id: 'ev-5',
          event_type: 'tool_call',
          agent_name: 'InfraAgent',
          tool_name: 'nmap_banner_grab',
          timestamp: timestamp + 2600,
          content: 'Intrusive port & service fingerprinting requested on staging cluster',
          tool_args: { target: 'jenkins-staging.apex-sec-defense.io (172.67.182.44)', ports: [8080, 50000, 22] },
          approval: {
            tool_id: 'tool-approval-jenkins',
            tool_name: 'nmap_banner_grab',
            target: '172.67.182.44 (jenkins-staging.apex-sec-defense.io)',
            risk_level: 'high',
            reason: 'Active banner interrogation against unauthenticated staging server. May trigger IDS/IPS alert.',
            parameters: { target_ip: '172.67.182.44', ports: '8080,50000', stealth_syn: true },
            status: 'pending',
            requested_at: timestamp + 2600,
          },
        },
        {
          id: 'ev-6',
          event_type: 'report',
          agent_name: 'Coordinator',
          timestamp: timestamp + 3500,
          content: `### External Attack Surface Analysis: \`apex-sec-defense.io\`

**Executive Summary:**
A passive reconnaissance cycle identified 4 mission-critical subdomains. Most critically, an exposed staging environment (\`jenkins-staging.apex-sec-defense.io\`) was discovered running on Cloudflare/Direct IP with basic authentication disabled.

#### Key Findings & Vectors
1. **Critical Vulnerability:** \`jenkins-staging.apex-sec-defense.io\` responds with \`HTTP 200 OK\` and exposes Jenkins v2.387 without CSRF token protection.
2. **Global VPN Endpoint:** \`vpn.apex-sec-defense.io\` (\`104.24.11.2\`) running Pulse Secure Gateway with potential CVE-2023-46805 exposure.
3. **Internal API Gateway:** \`api-internal.apex-sec-defense.io\` leaks Swagger OpenAPI documentation on \`/docs\`.

| Subdomain | IP Address | CDN / Provider | Risk Rating |
| :--- | :--- | :--- | :--- |
| \`vpn.apex-sec-defense.io\` | \`104.24.11.2\` | Cloudflare Enterprise | Medium |
| \`api-internal.apex-sec-defense.io\` | \`104.24.11.8\` | Cloudflare Enterprise | High |
| \`jenkins-staging.apex-sec-defense.io\` | \`172.67.182.44\` | Direct AWS us-east-1 | **CRITICAL** |
| \`auth.apex-sec-defense.io\` | \`104.24.11.19\` | Cloudflare Enterprise | Low |

**Recommended Mitigation:**
Immediately restrict ingress to \`jenkins-staging\` via IP whitelist and revoke exposed CI/CD test credentials.`,
        },
      ],
      artifacts: [
        {
          id: 'art-infra-1',
          artifact_type: 'infrastructure',
          identifier: 'jenkins-staging.apex-sec-defense.io -> 172.67.182.44',
          confidence: 0.98,
          source_tool: 'subfinder_passive_enum',
          grounded: true,
          evidence_snippet: 'Direct DNS A-record to AWS EC2 origin IP leaking unauthenticated Jenkins console.',
          timestamp: timestamp + 2000,
        },
        {
          id: 'art-infra-2',
          artifact_type: 'infrastructure',
          identifier: 'vpn.apex-sec-defense.io (104.24.11.2)',
          confidence: 0.95,
          source_tool: 'crt.sh_transparency',
          grounded: true,
          evidence_snippet: 'Valid SSL cert issued 2026-03-12 for apex-sec-defense.io SANs.',
          timestamp: timestamp + 2000,
        },
        {
          id: 'art-infra-3',
          artifact_type: 'credential',
          identifier: 'AKIA_PROD_LEAK_TEMP:492...11b',
          confidence: 0.89,
          source_tool: 'github_leak_scan',
          grounded: true,
          evidence_snippet: 'Found exposed in staging test environment config repo commit #94a2b.',
          timestamp: timestamp + 2200,
        },
      ],
    };
  }

  if (scenarioId === 'scenario-social-resolution') {
    return {
      activeAgentSequence: ['Coordinator', 'SocialSubAgent', 'Coordinator'],
      events: [
        {
          id: 'ev-1',
          event_type: 'thought',
          agent_name: 'Coordinator',
          timestamp: timestamp + 200,
          content: {
            title: 'Alias De-anonymization Protocol',
            steps: [
              {
                label: 'Handle Triage',
                desc: 'Target handle "shadow_vector_99". Checking handle uniqueness entropy score (94.2%).',
                status: 'complete',
              },
              {
                label: 'Cross-Platform Profiling',
                desc: 'Initiating Sherlock + Maigret across specialized technical forums, GitHub, Keybase, and Telegram.',
                status: 'complete',
              },
              {
                label: 'Delegating to SocialSubAgent',
                desc: 'Passing correlation matrix and avatar perceptual hash to SocialSubAgent.',
                status: 'active',
              },
            ],
          },
        },
        {
          id: 'ev-2',
          event_type: 'agent_handoff',
          agent_name: 'Coordinator',
          timestamp: timestamp + 800,
          content: 'Coordinator delegating social footprint enumeration to SocialSubAgent',
          handoff_from: 'Master Coordinator',
          handoff_to: 'SocialSubAgent',
          handoff_reason: 'Correlate private social accounts with public developer commits and cryptographic keys',
        },
        {
          id: 'ev-3',
          event_type: 'tool_call',
          agent_name: 'SocialSubAgent',
          tool_name: 'sherlock_alias_matrix',
          tool_args: { handle: 'shadow_vector_99', check_sites: ['github', 'telegram', 'dockerhub', 'keybase'] },
          timestamp: timestamp + 1400,
          content: 'Executing distributed handle resolution across developer platforms',
        },
        {
          id: 'ev-4',
          event_type: 'tool_result',
          agent_name: 'SocialSubAgent',
          tool_name: 'sherlock_alias_matrix',
          timestamp: timestamp + 2000,
          content: 'Positive matches on GitHub, Keybase, and DockerHub with identical avatar hash',
          tool_output: {
            handle: 'shadow_vector_99',
            matches: [
              { site: 'GitHub', url: 'https://github.com/shadow_vector_99', public_repos: 14, last_active: '3 hours ago' },
              { site: 'Keybase', key_fingerprint: '4A8F B832 C910 EE72', identity: 'David V. (Austin, TX)' },
              { site: 'Telegram', uid: '682910384', display_name: 'Dave | VectorOps' },
            ],
          },
        },
        {
          id: 'ev-5',
          event_type: 'tool_call',
          agent_name: 'SocialSubAgent',
          tool_name: 'breach_credential_pivot',
          timestamp: timestamp + 2500,
          content: 'Querying historical breach indices for linked email hashes',
          tool_args: { query_pattern: 'shadow_vector_99*', service: 'haveibeenpwned_enterprise' },
          approval: {
            tool_id: 'tool-approval-breach',
            tool_name: 'breach_credential_pivot',
            target: 'shadow_vector_99 / dave.v*@proton.me',
            risk_level: 'critical',
            reason: 'Analyst authorization required to query sensitive credential leak archives and PII.',
            parameters: { privacy_filter: 'masked', audit_logged: true },
            status: 'pending',
            requested_at: timestamp + 2500,
          },
        },
        {
          id: 'ev-6',
          event_type: 'report',
          agent_name: 'Coordinator',
          timestamp: timestamp + 3600,
          content: `### Identity Resolution Dossier: \`shadow_vector_99\`

**Identity Correlation:**
Target operating under alias **"shadow_vector_99"** successfully de-anonymized through cryptographic Keybase proof, GitHub commit metadata, and historical email cross-referencing.

#### Verified Identity Attributes
- **Full Name:** David "Dave" Vance
- **Primary Handle:** \`@shadow_vector_99\` / \`@dave_power_atx\`
- **Location:** Austin, Texas (UTC-5)
- **Occupation:** Staff DevOps Engineer / Security Researcher
- **PGP Fingerprint:** \`4A8F B832 C910 EE72 9011 41BA\`

| Platform | Verified Profile | Match Confidence | Source Proof |
| :--- | :--- | :---: | :--- |
| **GitHub** | \`github.com/shadow_vector_99\` | 99% | Commit email signoff \`dave@vance-ops.dev\` |
| **Keybase** | \`keybase.io/shadow_vector\` | 96% | Twitter proof + PGP public key signature |
| **Telegram** | \`t.me/dave_vectorops\` | 91% | Same avatar hash & timezone activity |
| **ProtonMail**| \`d*****.v****@proton.me\` | 88% | Recovery hint correlation |

**Intelligence Assessment:**
Target maintains strict operational security on primary social accounts, but operational leakage occurred through unmasked Git author signatures in public open-source pull requests.`,
        },
      ],
      artifacts: [
        {
          id: 'art-soc-1',
          artifact_type: 'profile',
          identifier: 'David Vance (@shadow_vector_99)',
          confidence: 0.99,
          source_tool: 'sherlock_alias_matrix',
          grounded: true,
          evidence_snippet: 'Grounded against GitHub PGP commit signature 4A8FB832 and Keybase bio.',
          timestamp: timestamp + 2000,
        },
        {
          id: 'art-soc-2',
          artifact_type: 'profile',
          identifier: 'dave@vance-ops.dev',
          confidence: 0.94,
          source_tool: 'git_log_analyzer',
          grounded: true,
          evidence_snippet: 'Author email extracted from public repository commit #4e819b.',
          timestamp: timestamp + 2100,
        },
        {
          id: 'art-soc-3',
          artifact_type: 'credential',
          identifier: 'PGP: 4A8F B832 C910 EE72',
          confidence: 0.96,
          source_tool: 'keybase_resolver',
          grounded: true,
          evidence_snippet: 'Public key published and cross-signed on MIT PGP keyserver.',
          timestamp: timestamp + 2200,
        },
      ],
    };
  }

  // Default: Scenario 1 (Gym IMINT -> Person Pivot)
  return {
    activeAgentSequence: ['Coordinator', 'GeoAgent', 'SocialSubAgent', 'Coordinator'],
    events: [
      {
        id: 'ev-1',
        event_type: 'thought',
        agent_name: 'Coordinator',
        timestamp: timestamp + 200,
        content: {
          title: 'Master Investigation Plan: Multi-Stage IMINT Pivot',
          steps: [
            {
              label: 'Step 1: Visual Feature Extraction & EXIF Triage',
              desc: 'Examining image metadata, reflective surfaces, gym machinery paint scheme, and window skyline.',
              status: 'complete',
            },
            {
              label: 'Step 2: Geolocation & Facility Identification',
              desc: 'Delegating architectural signature and equipment catalogue match to GeoAgent.',
              status: 'complete',
            },
            {
              label: 'Step 3: Social Check-In & Follower Triangulation',
              desc: 'Handoff to SocialSubAgent to query geo-fenced public Instagram & Strava segments.',
              status: 'active',
            },
          ],
        },
      },
      {
        id: 'ev-2',
        event_type: 'agent_handoff',
        agent_name: 'Coordinator',
        timestamp: timestamp + 800,
        content: 'Coordinator transferring imagery and geospatial clues to GeoAgent',
        handoff_from: 'Master Coordinator',
        handoff_to: 'GeoAgent',
        handoff_reason: 'Identify physical fitness facility from architectural layout & equipment manufacturer',
      },
      {
        id: 'ev-3',
        event_type: 'tool_call',
        agent_name: 'GeoAgent',
        tool_name: 'exiftool_and_imint_cv',
        tool_args: {
          image_target: 'gym_workout_photo_01.jpg',
          detect_signage: true,
          equipment_ocr: true,
        },
        timestamp: timestamp + 1400,
        content: 'Executing neural OCR and equipment database cross-referencing',
      },
      {
        id: 'ev-4',
        event_type: 'tool_result',
        agent_name: 'GeoAgent',
        tool_name: 'exiftool_and_imint_cv',
        timestamp: timestamp + 2000,
        content: 'Facility identified: MetroFlex Gym Austin (Brodie Ln, Austin, TX)',
        tool_output: {
          facility_name: 'MetroFlex Gym Austin',
          address: '4401 Freidrich Ln #301, Austin, TX 78744',
          coordinates: { lat: 30.2134, lng: -97.7491 },
          confidence_score: 0.94,
          matched_features: [
            'Distinctive yellow Hammer Strength ISO-lateral chest press',
            'Graffiti mural on North cinderblock wall',
            'South Congress skyline angle through transom windows',
          ],
        },
      },
      {
        id: 'ev-5',
        event_type: 'agent_handoff',
        agent_name: 'GeoAgent',
        timestamp: timestamp + 2400,
        content: 'GeoAgent handing off confirmed coordinates to SocialSubAgent',
        handoff_from: 'GeoAgent',
        handoff_to: 'SocialSubAgent',
        handoff_reason: 'Investigate Austin gym followers and recent physical check-ins for target profile',
      },
      {
        id: 'ev-6',
        event_type: 'tool_call',
        agent_name: 'SocialSubAgent',
        tool_name: 'geofence_social_scraper',
        timestamp: timestamp + 3000,
        content: 'Querying public social check-ins and Strava workout routes within 500m radius',
        tool_args: { location_lat: 30.2134, location_lng: -97.7491, radius_meters: 500 },
        approval: {
          tool_id: 'tool-approval-geofence',
          tool_name: 'geofence_social_scraper',
          target: '30.2134, -97.7491 (MetroFlex Gym Austin Radius)',
          risk_level: 'moderate',
          reason: 'Analyst authorization required to pull public geolocation metadata and match recent posts.',
          parameters: { coordinates: '30.2134,-97.7491', radius: '500m', platform: 'Strava/IG' },
          status: 'pending',
          requested_at: timestamp + 3000,
        },
      },
      {
        id: 'ev-7',
        event_type: 'report',
        agent_name: 'Coordinator',
        timestamp: timestamp + 4000,
        content: `### Intelligence Dossier: Physical Facility & Person Pivot

**Primary Finding:**
The provided photograph was captured inside **MetroFlex Gym Austin** (Austin, TX). Image analysis combined with geospatial triangulation and social check-in records decisively identified the person of interest as **Dave (@dave_power_atx)**.

#### Physical Location Breakdown
- **Facility:** MetroFlex Gym Austin
- **Physical Address:** 4401 Freidrich Ln #301, Austin, TX 78744
- **Coordinates:** \`30.2134° N, 97.7491° W\`
- **Facility Type:** Powerlifting / Hardcore Athletics Facility

#### Target Subject Profile
- **Confirmed Identity:** Dave Vance (\`@dave_power_atx\`)
- **Observed Schedule:** Mon / Wed / Fri between 06:15 AM - 07:45 AM CST
- **Associated Vehicle:** Dark Gray 2022 Ford F-150 (verified in parking exterior CCTV check-in)

| Verified Artifact | Type | Confidence | Verification Tool |
| :--- | :--- | :---: | :--- |
| \`MetroFlex Gym Austin\` | Location / Facility | 94% | \`exiftool_and_imint_cv\` |
| \`@dave_power_atx\` | Identity / Handle | 88% | \`geofence_social_scraper\` |
| \`30.2134, -97.7491\` | Geo Coordinates | 97% | \`geo_satellite_triangulation\` |
| \`dave.atx.power@gmail.com\` | Contact Pivot | 85% | \`strava_athlete_profile\` |

**Operational Assessment:**
Subject exhibits regular, predictable physical movement patterns matching weekday morning strength training routines.`,
      },
    ],
    artifacts: [
      {
        id: 'art-1',
        artifact_type: 'location',
        identifier: 'MetroFlex Gym, Austin, TX',
        confidence: 0.94,
        source_tool: 'exiftool_and_imint_cv',
        grounded: true,
        evidence_snippet: 'Mural artwork, yellow Hammer Strength machinery & window skyline match.',
        timestamp: timestamp + 2000,
      },
      {
        id: 'art-2',
        artifact_type: 'profile',
        identifier: '@dave_power_atx',
        confidence: 0.88,
        source_tool: 'geofence_social_scraper',
        grounded: true,
        evidence_snippet: 'Instagram location tag & Strava morning workout segment timestamp match.',
        timestamp: timestamp + 3000,
      },
      {
        id: 'art-3',
        artifact_type: 'location',
        identifier: '30.2134, -97.7491 (4401 Freidrich Ln)',
        confidence: 0.97,
        source_tool: 'geo_satellite_triangulation',
        grounded: true,
        evidence_snippet: 'Ground truth coordinates verified on USGS geospatial layer.',
        timestamp: timestamp + 2000,
      },
    ],
  };
}
