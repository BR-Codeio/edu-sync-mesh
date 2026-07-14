import React from 'react';
import { Library, BookOpen, FileText, Users, Download, Loader2, Zap } from 'lucide-react';

export default function LibraryTab({ lessons, setViewingLesson, showToast, handleShareContent, handleDownloadFromHub }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <Library className="w-8 h-8 text-orange-600" />
            My Library
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Downloaded</p>
            <p className="text-2xl font-bold text-orange-600">73 MB</p>
          </div>
        </div>

        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="border-2 border-orange-200 rounded-2xl p-5 hover:border-orange-400 transition bg-gradient-to-r from-white to-orange-50">
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl ${
                    lesson.downloaded ? 'bg-gradient-to-br from-green-500 to-teal-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}
                >
                  {lesson.subject[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {lesson.title}
                    {lesson.completed && <span className="ml-2 text-sm text-green-600 font-semibold">✓ Completed</span>}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {lesson.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {lesson.size}
                    </span>
                    {lesson.level && (
                      <span className="flex items-center gap-1 text-blue-700 font-medium">
                        {lesson.level}{lesson.year ? ` • ${lesson.year}` : ''}{lesson.paperType ? ` • ${lesson.paperType}` : ''}
                      </span>
                    )}
                    {lesson.receivedFrom && (
                      <span className="flex items-center gap-1 text-green-700 font-medium">
                        <Users className="w-4 h-4" />
                        Received from {lesson.receivedFrom} via P2P
                      </span>
                    )}
                  </div>

                  {lesson.downloaded ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setViewingLesson(lesson)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        Open Lesson
                      </button>
                      <button
                        onClick={() => handleShareContent(lesson.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Share (+5 coins)
                      </button>
                    </div>
                  ) : lesson.source === 'hub' ? (
                    <button
                      onClick={() => handleDownloadFromHub(lesson.id)}
                      disabled={lesson.downloading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
                    >
                      {lesson.downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {lesson.downloading ? 'Downloading…' : 'Download from Village Hub'}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        showToast('This lesson downloads automatically on the next Data Mule Sync.', {
                          icon: <Zap className="w-6 h-6 text-amber-500" />,
                        })
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Available on next sync
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}