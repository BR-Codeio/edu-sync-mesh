import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, FileText, Download } from 'lucide-react';

const DURATION_SECONDS = 12 * 60 + 30; // 12:30, matches the label
const PLAYBACK_SPEED = 12; // 1 real second = 12 simulated video seconds, so a 12:30 lesson "plays" in ~1 minute during a demo

export default function LessonModal({ lesson, onClose, onComplete }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Reset playback whenever a new lesson is opened
    setCurrentTime(0);
    setPlaying(false);
    return () => clearInterval(intervalRef.current);
  }, [lesson?.id]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + PLAYBACK_SPEED;
          if (next >= DURATION_SECONDS) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return DURATION_SECONDS;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  if (!lesson) return null;

  const togglePlay = () => {
    if (currentTime >= DURATION_SECONDS) {
      setCurrentTime(0);
    }
    setPlaying((p) => !p);
  };

  const seekTo = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setCurrentTime(Math.floor(ratio * DURATION_SECONDS));
  };

  const progressPct = (currentTime / DURATION_SECONDS) * 100;
  const finished = currentTime >= DURATION_SECONDS;

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
          <p className="text-orange-100 text-sm mt-1">
            {lesson.size} • Stored locally on Village Hub
            {lesson.level && ` • ${lesson.level}${lesson.year ? ` (${lesson.year})` : ''}${lesson.paperType ? ` • ${lesson.paperType}` : ''}`}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {lesson.resourceType === 'document' && lesson.videoUrl ? (
            <div className="bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
              <iframe src={lesson.videoUrl} title={lesson.title} className="w-full" style={{ height: '500px' }} />
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500">Streaming directly from the Village Hub over the local network</p>
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          ) : lesson.videoUrl ? (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <video
                key={lesson.videoUrl}
                src={lesson.videoUrl}
                controls
                className="w-full aspect-video bg-black"
              >
                Your browser does not support video playback.
              </video>
              <p className="text-xs text-white/60 px-3 py-2">
                Streaming directly from the Village Hub over the local network
              </p>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden group">
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {finished ? (
                  <RotateCcw className="w-9 h-9 text-white" />
                ) : playing ? (
                  <Pause className="w-9 h-9 text-white" />
                ) : (
                  <Play className="w-9 h-9 text-white ml-1" />
                )}
              </button>

              {finished && (
                <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-green-600 px-3 py-1 rounded-full">
                  Lesson video complete
                </span>
              )}

              {/* Seek bar */}
              <div
                onClick={seekTo}
                className="absolute bottom-8 left-3 right-3 h-1.5 bg-white/20 rounded-full cursor-pointer"
              >
                <div
                  className="h-full bg-orange-500 rounded-full transition-[width] duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <span className="absolute bottom-3 left-3 text-xs text-white/70 bg-black/40 px-2 py-1 rounded">
                Offline video (demo) • {formatTime(currentTime)} / {formatTime(DURATION_SECONDS)}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Key Points Covered
              {lesson.keyPoints ? (
                <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Written by teacher</span>
              ) : (
                <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Sample placeholder</span>
              )}
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
            {lesson.videoUrl && (
              <a
                href={lesson.videoUrl}
                download={`${lesson.title}.${lesson.resourceType === 'document' ? 'pdf' : 'mp4'}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                title="Save this file to your device — once downloaded, it works with zero internet, even without the Village Hub nearby"
              >
                <Download className="w-5 h-5" />
                Download for Offline Use
              </a>
            )}
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

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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