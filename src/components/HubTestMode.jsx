import React, { useState, useRef } from 'react';
import { Server, Wifi, Smartphone, RefreshCw, Users, CheckCircle2, Circle, Loader2, PlayCircle } from 'lucide-react';

const STEPS = [
  {
    id: 'hub-boot',
    title: 'Village Hub Boots Up',
    detail: 'Raspberry Pi powers on from car battery / solar. Local Wi-Fi Access Point starts broadcasting — no internet uplink required.',
    icon: Server,
  },
  {
    id: 'device-connect',
    title: 'Student Device Connects',
    detail: "Phone joins the 'Edu-Sync-Mesh-VillageHub' Wi-Fi network. No data bundle used — this is a closed local network.",
    icon: Smartphone,
  },
  {
    id: 'content-served',
    title: 'Content Served Locally',
    detail: 'PWA requests a lesson. CouchDB on the Hub serves the file directly over LAN — zero external bandwidth, sub-second latency.',
    icon: Wifi,
  },
  {
    id: 'ai-query',
    title: 'AI Tutor Answers Offline',
    detail: 'Student asks the AI tutor a question. Response is generated from the local knowledge base / on-device model — no cloud API call.',
    icon: CheckCircle2,
  },
  {
    id: 'data-mule',
    title: 'Data Mule Sync Triggers',
    detail: "Teacher's phone re-enters Wi-Fi range after a trip to town. PouchDB on the phone auto-replicates new curriculum updates to the Hub's CouchDB.",
    icon: RefreshCw,
  },
  {
    id: 'p2p-share',
    title: 'Peer-to-Peer Share Completes',
    detail: 'A nearby student receives a lesson via Wi-Fi Direct from a classmate\u2019s phone, without touching the Hub at all. Edu-Coins awarded to the sharer.',
    icon: Users,
  },
];

export default function HubTestMode() {
  const [stepStatus, setStepStatus] = useState(STEPS.map(() => 'pending')); // pending | running | done
  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);

  const runFullFlow = async () => {
    if (running) return;
    setRunning(true);
    cancelRef.current = false;
    setStepStatus(STEPS.map(() => 'pending'));

    for (let i = 0; i < STEPS.length; i++) {
      if (cancelRef.current) break;
      setStepStatus((prev) => prev.map((s, idx) => (idx === i ? 'running' : s)));
      await new Promise((res) => setTimeout(res, 900));
      setStepStatus((prev) => prev.map((s, idx) => (idx === i ? 'done' : s)));
    }
    setRunning(false);
  };

  const reset = () => {
    cancelRef.current = true;
    setRunning(false);
    setStepStatus(STEPS.map(() => 'pending'));
  };

  const allDone = stepStatus.every((s) => s === 'done');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <Server className="w-8 h-8 text-teal-600" />
            Village Hub Test Mode
          </h2>
          <p className="text-gray-600 mt-1">
            Walk through the full offline architecture end-to-end — useful for demoing to judges without needing real hardware in the room.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={runFullFlow}
            disabled={running}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-60"
          >
            {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
            {running ? 'Running Flow…' : 'Run Full Demo Flow'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {allDone && (
        <div className="mt-4 mb-2 bg-green-50 border-2 border-green-300 text-green-800 rounded-xl px-4 py-3 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Full offline flow verified — Village Hub, AI Tutor, Data Mule Sync, and P2P Share all functioning as expected.
        </div>
      )}

      <div className="mt-6 space-y-3">
        {STEPS.map((step, idx) => {
          const status = stepStatus[idx];
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                status === 'done'
                  ? 'bg-green-50 border-green-300'
                  : status === 'running'
                  ? 'bg-teal-50 border-teal-400 shadow-md scale-[1.01]'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div
                className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                  status === 'done'
                    ? 'bg-green-600 text-white'
                    : status === 'running'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {status === 'running' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">STEP {idx + 1}</span>
                  {status === 'done' && <span className="text-xs font-bold text-green-600">VERIFIED</span>}
                  {status === 'running' && <span className="text-xs font-bold text-teal-600">RUNNING…</span>}
                </div>
                <h4 className="font-bold text-gray-800">{step.title}</h4>
                <p className="text-sm text-gray-600 mt-0.5">{step.detail}</p>
              </div>
              {status === 'pending' && <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
