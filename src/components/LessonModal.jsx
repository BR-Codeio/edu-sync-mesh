import React from 'react';
import { X, PlayCircle, CheckCircle2, FileText } from 'lucide-react';

export default function LessonModal({ lesson, onClose, onComplete }) {
  if (!lesson) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-t-2xl text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <p className="text-orange-100 text-sm font-semibold mb-1">{lesson.subject}</p>
          <h2 className="text-2xl font-black">{lesson.title}</h2>
          <p className="text-orange-100 text-sm mt-1">{lesson.size} • Stored locally on Village Hub</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
            <PlayCircle className="w-16 h-16 text-white/80" />
            <span className="absolute bottom-3 left-3 text-xs text-white/70 bg-black/40 px-2 py-1 rounded">
              Offline video • 0:00 / 12:30
            </span>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Key Points Covered
            </h3>
            <ul className="space-y-2">
              {(lesson.keyPoints || defaultKeyPoints(lesson.subject)).map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onComplete(lesson.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark as Complete (+2 Edu-Coins)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function defaultKeyPoints(subject) {
  const map = {
    Maths: ['Core formula and when to use it', 'Worked example step-by-step', '3 practice questions with solutions'],
    Chemistry: ['Key definitions and terminology', 'Diagram walkthrough', 'Common exam question patterns'],
    Shona: ['Nhoroondo yebhuku / chapter summary', 'Vazhinji vanhu / key characters or themes', 'Mibvunzo yekudzidzira'],
    Biology: ['Labelled diagram breakdown', 'Process explained step-by-step', 'ZIMSEC past-paper style questions'],
  };
  return map[subject] || ['Core concept overview', 'Worked examples', 'Practice questions'];
}
