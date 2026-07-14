import React from 'react';
import { WifiOff, MessageSquare, Users, BookOpen, ChevronRight, Zap } from 'lucide-react';

export default function HomeTab({ lessons, setViewingLesson, showToast }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />

        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-3">Learn Without Limits</h2>
          <p className="text-xl text-orange-100 mb-6 max-w-2xl">
            No internet? No problem. Access ZIMSEC curriculum, AI tutoring, and peer learning—all offline.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="text-2xl font-bold">247</span>
              <span className="text-sm ml-2">Lessons Downloaded</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="text-2xl font-bold">0 MB</span>
              <span className="text-sm ml-2">Data Used Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <WifiOff className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Offline-First</h3>
          <p className="text-gray-600">All lessons stored locally. Learn anytime, anywhere—no data needed.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">AI Tutor in Shona</h3>
          <p className="text-xs font-semibold text-green-600 italic mb-2">&quot;Denhe reruzivo neZvirungamutauro&quot;</p>
          <p className="text-gray-600">Ask questions in Shona or English. Get instant answers from local AI.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Peer Sharing</h3>
          <p className="text-gray-600">Share lessons via Wi-Fi Direct. Earn Edu-Coins with every share!</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-600" />
          Continue Learning
        </h3>
        <div className="space-y-3">
          {lessons.slice(0, 3).map((lesson) => (
            <button
              key={lesson.id}
              onClick={() =>
                lesson.downloaded
                  ? setViewingLesson(lesson)
                  : showToast('Available on next sync — connect Data Mule Sync first.', {
                      icon: <Zap className="w-6 h-6 text-amber-500" />,
                    })
              }
              className="w-full flex items-center gap-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition cursor-pointer text-left"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                {lesson.subject[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">{lesson.title}</h4>
                <p className="text-sm text-gray-600">
                  {lesson.subject} • {lesson.size}
                  {lesson.completed ? ' • Completed ✓' : ''}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}