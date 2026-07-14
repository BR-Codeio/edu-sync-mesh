import React, { useState, useRef } from 'react';
import { UploadCloud, Video, FileText, CheckCircle2, Loader2, Server, AlertTriangle } from 'lucide-react';
import { uploadLessonAPI } from '../lib/api.js';

const SUBJECTS = ['Maths', 'Biology', 'Chemistry', 'Physics', 'English', 'Shona', 'Geography', 'History', 'Commerce'];
const LEVELS = ['Grade 7', 'O Level', 'A Level'];
const PAPER_TYPES = ['Specimen Paper', 'Question Paper', 'Marking Scheme', 'Syllabus'];

export default function TeacherUpload({ backendOnline, onUploaded, showToast }) {
  const [contentType, setContentType] = useState('video'); // 'video' | 'document'
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Maths');
  const [level, setLevel] = useState('O Level');
  const [year, setYear] = useState('');
  const [paperType, setPaperType] = useState('Specimen Paper');
  const [keyPoints, setKeyPoints] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setTitle('');
    setYear('');
    setKeyPoints('');
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!title.trim() || !file) {
      showToast(`Add a title and choose a ${contentType === 'video' ? 'video' : 'PDF'} file first.`, {
        icon: <Video className="w-6 h-6 text-amber-500" />,
      });
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const points = keyPoints
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);
      const extra = contentType === 'document' ? { level, year: year.trim(), paperType } : {};
      const result = await uploadLessonAPI(title.trim(), subject, file, setProgress, points, extra);
      showToast(`"${result.lesson.title}" uploaded to the Village Hub — every student can now download it.`, {
        icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
      });
      onUploaded?.(result.lesson);
      resetForm();
    } catch (err) {
      showToast(`Upload failed: ${err.message}`, { icon: <Video className="w-6 h-6 text-red-500" /> });
    } finally {
      setUploading(false);
    }
  };

  if (!backendOnline) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <Server className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Village Hub Backend Required</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Uploading real content needs somewhere to actually store it — that&apos;s the Village Hub backend
          (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">server/</code>). Start it (see README),
          then come back here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-3xl font-black text-gray-800 mb-2 flex items-center gap-2">
        <UploadCloud className="w-8 h-8 text-orange-600" />
        Upload Content (Teacher)
      </h2>
      <p className="text-gray-600 mb-6">
        Add a real lesson video or past paper to the Village Hub. Once uploaded, it&apos;s immediately available
        for every student device to download — no internet needed on their end.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setContentType('video')}
          disabled={uploading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border-2 transition ${
            contentType === 'video' ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-200 text-gray-600 hover:border-orange-300'
          } disabled:opacity-60`}
        >
          <Video className="w-5 h-5" />
          Video Lesson
        </button>
        <button
          onClick={() => setContentType('document')}
          disabled={uploading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border-2 transition ${
            contentType === 'document' ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-200 text-gray-600 hover:border-orange-300'
          } disabled:opacity-60`}
        >
          <FileText className="w-5 h-5" />
          Past Paper / Document (PDF)
        </button>
      </div>

      {contentType === 'document' && (
        <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Copyright reminder:</strong> most past ZIMSEC exam papers are copyrighted. Only upload official
            ZIMSEC specimen papers, syllabi, marking schemes you have rights to share, or papers your school has
            explicit permission to distribute — not scanned copies of protected past exam papers.
          </p>
        </div>
      )}

      <div className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {contentType === 'video' ? 'Lesson Title' : 'Document Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={contentType === 'video' ? 'e.g. Mathematics - Simultaneous Equations' : 'e.g. 2024 Mathematics Paper 1'}
            disabled={uploading}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={uploading}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none disabled:opacity-60"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {contentType === 'document' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={uploading}
                className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none disabled:opacity-60 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                disabled={uploading}
                className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none disabled:opacity-60 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                disabled={uploading}
                className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none disabled:opacity-60 text-sm"
              >
                {PAPER_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Key Points Covered <span className="font-normal text-gray-400">(one per line — this is what students see as a summary, so make it real)</span>
          </label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder={
              contentType === 'video'
                ? 'e.g.\nMabviro Nemauto — chapter 3 summary\nMain characters and their role in the story\n3 comprehension questions to discuss in class'
                : 'e.g.\nCovers algebra, geometry, and trigonometry\nPaper 1 (non-calculator), 2 hours\nMatches the current ZIMSEC syllabus'
            }
            disabled={uploading}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none disabled:opacity-60 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {contentType === 'video' ? 'Video File' : 'PDF File'}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={contentType === 'video' ? 'video/mp4,video/webm,video/ogg,video/quicktime' : 'application/pdf'}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-700 file:font-semibold hover:file:bg-orange-200 disabled:opacity-60"
          />
          {file && (
            <p className="text-xs text-gray-500 mt-1">
              {file.name} • {(file.size / (1024 * 1024)).toFixed(1)}MB
            </p>
          )}
        </div>

        {uploading && (
          <div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-orange-600 h-full transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">{progress}% uploaded</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
          {uploading ? 'Uploading to Village Hub…' : 'Upload to Village Hub'}
        </button>
      </div>
    </div>
  );
}