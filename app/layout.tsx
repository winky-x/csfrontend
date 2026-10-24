import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Autonomous CyberOSINT Workstation',
  description: 'Next-generation Autonomous CyberOSINT Investigation Workstation featuring multi-agent orchestration, interactive chain of thought, live tool execution approval, verified artifacts ledger, and auto-scrolling telemetry terminal.',
  openGraph: {
    title: 'Autonomous CyberOSINT Workstation',
    description: 'Next-generation Autonomous CyberOSINT Investigation Workstation featuring multi-agent orchestration, interactive chain of thought, live tool execution approval, verified artifacts ledger, and auto-scrolling telemetry terminal.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autonomous CyberOSINT Workstation',
    description: 'Next-generation Autonomous CyberOSINT Investigation Workstation featuring multi-agent orchestration, interactive chain of thought, live tool execution approval, verified artifacts ledger, and auto-scrolling telemetry terminal.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-[#090a0f] text-zinc-100 antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
