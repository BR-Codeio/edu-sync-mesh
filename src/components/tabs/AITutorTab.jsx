import React from 'react';
import {
  MessageSquare, Sparkles, ExternalLink, Send, Zap, HelpCircle, CheckCircle2, Clock,
} from 'lucide-react';
import { SAMPLE_QUESTIONS, getSearchUrl } from '../../lib/aiEngine.js';

export default function AITutorTab({
  backendOnline,
  hubQA,
  pendingQuestions,
  chatMessages,
  isAITyping,
  userInput,
  setUserInput,
  handleSendMessage,
  askTutor,
  recheckBackend,
  chatEndRef,
}) {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: '640px' }}>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <MessageSquare className="w-7 h-7" />
                AI Tutor - Offline Mode
              </h2>
              <p className="text-purple-200 text-sm mt-1">Ask in Shona or English • 9 ZIMSEC subjects covered</p>
              {chatMessages.slice().reverse().find((m) => m.type === 'ai' && m.subject === 'Shona') && (
                <p className="text-xs text-green-200 mt-1 italic">Shona AI Tutor — &quot;Denhe reruzivo neZvirungamutauro&quot;</p>
              )}
            </div>
            <span
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                backendOnline ? 'bg-green-500/20 text-green-100' : 'bg-amber-500/20 text-amber-100'
              }`}
              title={backendOnline ? 'Connected to Village Hub backend — answers persist for every student' : 'Backend not running — using in-browser fallback only'}
            >
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-400' : 'bg-amber-400'}`} />
              {backendOnline === null ? 'Checking Hub…' : backendOnline ? 'Hub Backend Connected' : 'Local Fallback Mode'}
            </span>
            {!backendOnline && (
              <button onClick={recheckBackend} className="flex-shrink-0 text-xs font-semibold text-purple-200 hover:text-white underline">
                Recheck
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-purple-50 to-white">
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Start Learning!</h3>
              <p className="text-gray-600 mb-4">Ask me anything about your ZIMSEC subjects</p>
              <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => askTutor(q)} className="p-4 bg-purple-100 rounded-xl hover:bg-purple-200 transition text-left">
                    <p className="font-semibold text-purple-900 text-sm">{q}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                    : msg.synced
                    ? 'bg-green-100 border-2 border-green-300 text-gray-800'
                    : 'bg-purple-100 text-gray-800'
                } rounded-2xl px-5 py-3 shadow-lg`}
              >
                {msg.synced && (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-green-600 mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Synced answer
                  </p>
                )}
                {msg.subject && (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-purple-500 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {msg.subject}
                  </p>
                )}
                <p className="text-sm mb-1 whitespace-pre-wrap">{msg.text}</p>
                {msg.sourceUrl && (
                  <a
                    href={msg.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs font-semibold underline mb-1 ${
                      msg.synced ? 'text-green-700 hover:text-green-900' : 'text-purple-700 hover:text-purple-900'
                    }`}
                  >
                    <ExternalLink className="w-3 h-3" /> Original source (optional)
                  </a>
                )}
                <p className={`text-xs ${msg.type === 'user' ? 'text-orange-200' : msg.synced ? 'text-green-600' : 'text-purple-600'}`}>{msg.timestamp}</p>
              </div>
            </div>
          ))}

          {isAITyping && (
            <div className="flex justify-start">
              <div className="bg-purple-100 rounded-2xl px-5 py-3 shadow-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-gray-50 border-t-2 border-purple-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your question... (e.g., 'Explain photosynthesis' or 'Ndibatsire ne biology')"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:outline-none text-gray-800"
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">🔒 All AI processing happens locally on Village Hub • Zero data cost</p>
        </div>
      </div>

      {backendOnline && (hubQA.pending.length > 0 || hubQA.resolved.length > 0) && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            Village Hub Knowledge Base
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Questions asked by any student. Once resolved during a Data Mule Sync, the answer is stored permanently on the Hub —
            every student can read it fully offline from then on, no internet needed.
          </p>
          <div className="space-y-3">
            {hubQA.resolved.slice().reverse().map((r) => (
              <div key={r.id} className="p-4 rounded-xl border-2 bg-green-50 border-green-300">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-800 flex-1">{r.question}</p>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Stored offline on Hub
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{r.answer}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {r.fromLocalKnowledgeBase ? 'From local knowledge base' : 'Resolved via Data Mule Sync'}
                    {r.resolvedAt && ` • ${new Date(r.resolvedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}`}
                  </p>
                  {r.sourceUrl && (
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-900 underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Original source (optional, needs internet)
                    </a>
                  )}
                </div>
              </div>
            ))}

            {hubQA.pending.slice().reverse().map((p) => (
              <div key={p.id} className="p-4 rounded-xl border-2 bg-amber-50 border-amber-300">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-800 flex-1">{p.question}</p>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> Waiting for sync
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Asked {new Date(p.askedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </p>
                <p className="text-xs text-amber-700 mt-2">Will be looked up and saved to the Hub permanently on the next Data Mule Sync.</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!backendOnline && pendingQuestions.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            Questions Waiting on Sync
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            The Village Hub backend isn&apos;t running on this device, so answers can&apos;t be permanently stored for other students
            right now — this device is tracking questions locally only. Start the backend (see README) for real, permanent offline
            storage.
          </p>
          <div className="space-y-3">
            {pendingQuestions.slice().reverse().map((pq) => (
              <div
                key={pq.id}
                className={`p-4 rounded-xl border-2 ${pq.status === 'resolved' ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-800 flex-1">{pq.question}</p>
                  {pq.status === 'resolved' ? (
                    <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Waiting for sync
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Asked {new Date(pq.askedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </p>
                {pq.status === 'resolved' ? (
                  <a
                    href={getSearchUrl(pq.question)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-green-700 hover:text-green-800 underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    No backend running — view a possible answer online instead
                  </a>
                ) : (
                  <p className="text-xs text-amber-700 mt-2">Check again after the next Data Mule Sync, or within 24 hours.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}