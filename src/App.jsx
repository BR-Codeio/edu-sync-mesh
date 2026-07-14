import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi, WifiOff, Download, Users, Award, Zap, Radio,
  MessageSquare, Home, Library, Menu, X,
  Server, Loader2, CheckCircle2, Clock, UploadCloud,
} from 'lucide-react';
import { getTutorResponse } from './lib/aiEngine.js';
import { checkBackendHealth, askTutorAPI, triggerSyncAPI, fetchPendingAPI, fetchResolvedAPI, fetchHubLessons } from './lib/api.js';
import { useToast } from './components/Toast.jsx';
import LessonModal from './components/LessonModal.jsx';
import HubTestMode from './components/HubTestMode.jsx';
import TeacherUpload from './components/TeacherUpload.jsx';
import HomeTab from './components/tabs/HomeTab.jsx';
import LibraryTab from './components/tabs/LibraryTab.jsx';
import AITutorTab from './components/tabs/AITutorTab.jsx';
import P2PShareTab from './components/tabs/P2PShareTab.jsx';

export default function EduSyncMesh() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('home');
  const [hubConnected, setHubConnected] = useState(true); // presenter-controlled, not random
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('Not yet synced this session');
  const [eduCoins, setEduCoins] = useState(47);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewingLesson, setViewingLesson] = useState(null);
  const [pendingQuestions, setPendingQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('edu-sync-pending-questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('edu-sync-pending-questions', JSON.stringify(pendingQuestions));
    } catch {
      // Storage unavailable (e.g. private browsing) — queue just won't persist across reloads
    }
  }, [pendingQuestions]);

  const [lessons, setLessons] = useState([
    { id: 1, title: 'Mathematics - Quadratic Equations', subject: 'Maths', size: '15MB', downloaded: true, completed: false },
    { id: 2, title: 'Chemistry - Periodic Table', subject: 'Chemistry', size: '22MB', downloaded: false, completed: false },
    { id: 3, title: 'Shona - Mabviro Nemauto', subject: 'Shona', size: '8MB', downloaded: true, completed: false },
    { id: 4, title: 'Biology - Cell Structure', subject: 'Biology', size: '18MB', downloaded: true, completed: false },
  ]);

  const [sharedContent, setSharedContent] = useState([
    { id: 1, title: 'ZIMSEC Maths O-Level Module 3', size: '12MB', sharedBy: 'Tendai M.', coins: 5, downloading: false, downloaded: false },
    { id: 2, title: 'English Literature: Poetry Analysis', size: '8MB', sharedBy: 'Chipo K.', coins: 3, downloading: false, downloaded: false },
  ]);
  const [sharedCount, setSharedCount] = useState(14);
  const [downloadedCount, setDownloadedCount] = useState(8);

  const chatEndRef = useRef(null);
  const [backendOnline, setBackendOnline] = useState(null); // null = checking, true/false once known
  const [hubQA, setHubQA] = useState({ pending: [], resolved: [] }); // what's REALLY stored on the Hub

  const refreshHubQA = async () => {
    try {
      const [pending, resolved] = await Promise.all([fetchPendingAPI(), fetchResolvedAPI()]);
      setHubQA({ pending, resolved });
    } catch {
      // Backend unreachable — leave hubQA as-is, UI falls back to local-only state
    }
  };

  const refreshHubLessons = async () => {
    try {
      const hubLessons = await fetchHubLessons();
      setLessons((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const newOnes = hubLessons
          .filter((hl) => !existingIds.has(hl.id))
          .map((hl) => ({
            id: hl.id,
            title: hl.title,
            subject: hl.subject,
            size: hl.size,
            downloaded: false,
            completed: false,
            videoUrl: hl.videoUrl,
            keyPoints: hl.keyPoints || null,
            resourceType: hl.resourceType || 'video',
            level: hl.level || null,
            year: hl.year || null,
            paperType: hl.paperType || null,
            source: 'hub',
          }));
        return [...prev, ...newOnes];
      });
    } catch {
      // Backend unreachable — no real Hub lessons to show
    }
  };

  const recheckBackend = async () => {
    setBackendOnline(null);
    const online = await checkBackendHealth();
    setBackendOnline(online);
    if (online) {
      refreshHubQA();
      refreshHubLessons();
      showToast('Village Hub backend connected!', { icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> });
    } else {
      showToast('Still can\u2019t reach the backend — make sure `npm start` is running in the server folder.', {
        icon: <WifiOff className="w-6 h-6 text-amber-500" />,
      });
    }
  };

  useEffect(() => {
    let cancelled = false;
    let interval;

    const check = async () => {
      const online = await checkBackendHealth();
      if (cancelled) return;
      setBackendOnline(online);
      if (online) {
        refreshHubQA();
        refreshHubLessons();
        clearInterval(interval); // connected — stop polling, other flows keep it fresh from here
      }
    };

    check(); // immediate check on load

    // Keep retrying every 4s until connected — covers the common case of
    // starting the backend server after the frontend page is already open.
    interval = setInterval(() => {
      if (!cancelled) check();
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAITyping]);

  // ---------- AI Tutor ----------
  const askTutor = async (rawQuery) => {
    const query = rawQuery.trim();
    if (!query) return;

    setChatMessages((prev) => [
      ...prev,
      { type: 'user', text: query, timestamp: nowStr() },
    ]);
    setUserInput('');
    setIsAITyping(true);

    const delay = Math.min(1800, 700 + query.length * 15);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Try the real Village Hub backend first — it has persistent, shared storage,
    // so a question resolved for one student stays answered for everyone. If the
    // backend isn't running, fall back to pure in-browser matching so the demo
    // never breaks.
    try {
      const result = await askTutorAPI(query);

      if (result.status === 'resolved') {
        setChatMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            text: result.answer,
            subject: result.subject,
            sourceUrl: result.sourceUrl,
            fromCache: result.cached,
            timestamp: nowStr(),
          },
        ]);
        setIsAITyping(false);
        if (result.cached) {
          showToast('Answered instantly from the Village Hub\u2019s stored knowledge.', {
            icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
          });
        } else {
          refreshHubQA();
        }
        return;
      }

      // status === 'pending'
      setChatMessages((prev) => [
        ...prev,
        { type: 'ai', text: result.message, subject: null, timestamp: nowStr() },
      ]);
      setIsAITyping(false);
      showToast('Question saved to the Village Hub \u2014 it\u2019ll be looked up on the next Data Mule Sync, then stored offline for everyone.', {
        icon: <Clock className="w-6 h-6 text-amber-500" />,
      });
      refreshHubQA();
      return;
    } catch {
      // Backend unreachable — fall back to local matching + localStorage queue.
    }

    const { text, subject, unresolved } = getTutorResponse(query);
    setChatMessages((prev) => [
      ...prev,
      { type: 'ai', text, subject, timestamp: nowStr() },
    ]);
    setIsAITyping(false);

    if (unresolved) {
      setPendingQuestions((prev) => {
        const alreadyQueued = prev.some(
          (p) => p.question.toLowerCase() === query.toLowerCase() && p.status === 'pending'
        );
        if (alreadyQueued) return prev;
        return [
          ...prev,
          {
            id: Date.now(),
            question: query,
            askedAt: new Date().toISOString(),
            status: 'pending',
          },
        ];
      });
      showToast('Question saved locally — it\u2019ll be looked up on the next Data Mule Sync.', {
        icon: <Clock className="w-6 h-6 text-amber-500" />,
      });
    }
  };

  const handleSendMessage = () => askTutor(userInput);

  // ---------- Library ----------
  const handleShareContent = (lessonId) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || !lesson.downloaded) return;
    setEduCoins((prev) => prev + 5);
    setSharedCount((prev) => prev + 1);
    showToast(`Sharing "${lesson.title}" via Wi-Fi Direct — +5 Edu-Coins earned!`, {
      icon: <Award className="w-6 h-6 text-yellow-500" />,
    });
  };

  const handleCompleteLesson = (lessonId) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, completed: true } : l))
    );
    setEduCoins((prev) => prev + 2);
    setViewingLesson(null);
    showToast('Lesson marked complete — +2 Edu-Coins!', {
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    });
  };

  // Real download from the Village Hub — actually fetches the video bytes over
  // the local network (proving the file is genuinely there and reachable), then
  // marks it downloaded so the student can open it, share it via P2P, etc.
  const handleDownloadFromHub = async (lessonId) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || lesson.downloaded || lesson.downloading) return;

    setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, downloading: true } : l)));

    try {
      const res = await fetch(lesson.videoUrl);
      if (!res.ok) throw new Error(`Village Hub returned ${res.status}`);
      await res.blob(); // pull the actual bytes down, proving real local-network transfer

      setLessons((prev) =>
        prev.map((l) => (l.id === lessonId ? { ...l, downloading: false, downloaded: true } : l))
      );
      showToast(`Downloaded "${lesson.title}" from the Village Hub — available offline now.`, {
        icon: <Download className="w-6 h-6 text-blue-600" />,
      });
    } catch (err) {
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, downloading: false } : l)));
      showToast(`Couldn't download "${lesson.title}" — ${err.message}`, {
        icon: <WifiOff className="w-6 h-6 text-red-500" />,
      });
    }
  };

  const handleLessonUploaded = (hubLesson) => {
    setLessons((prev) => [
      ...prev,
      {
        id: hubLesson.id,
        title: hubLesson.title,
        subject: hubLesson.subject,
        size: hubLesson.size,
        downloaded: false,
        completed: false,
        videoUrl: hubLesson.videoUrl,
        keyPoints: hubLesson.keyPoints || null,
        resourceType: hubLesson.resourceType || 'video',
        level: hubLesson.level || null,
        year: hubLesson.year || null,
        paperType: hubLesson.paperType || null,
        source: 'hub',
      },
    ]);
  };

  // ---------- P2P Share ----------
  const handleDownloadShared = (itemId) => {
    const item = sharedContent.find((i) => i.id === itemId);
    if (!item || item.downloading || item.downloaded) return;

    setSharedContent((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, downloading: true } : i))
    );

    setTimeout(() => {
      setSharedContent((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, downloading: false, downloaded: true } : i))
      );
      setDownloadedCount((prev) => prev + 1);

      // A downloaded lesson isn't useful if there's nowhere to open it — add it
      // to the learner's Library, same as a Data Mule Sync download would.
      setLessons((prev) => [
        ...prev,
        {
          id: `p2p_${item.id}_${Date.now()}`,
          title: item.title,
          subject: inferSubject(item.title),
          size: item.size,
          downloaded: true,
          completed: false,
          receivedFrom: item.sharedBy,
        },
      ]);

      showToast(`Downloaded "${item.title}" from ${item.sharedBy} via Wi-Fi Direct — now in My Library.`, {
        icon: <Download className="w-6 h-6 text-blue-600" />,
      });
    }, 1400);
  };

  // ---------- Data Mule Sync ----------
  const simulateSync = () => {
    if (syncing) return;
    setSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          finishSync();
          return 100;
        }
        return prev + 10;
      });
    }, 280);
  };

  const finishSync = async () => {
    setSyncing(false);
    setLastSynced(nowStr());

    // Try the real backend sync (actual Wikipedia lookup for queued questions).
    try {
      const result = await triggerSyncAPI();
      await refreshHubQA();

      if (result.resolvedCount > 0) {
        // Continue the conversation for any of THIS user's own questions that just
        // got resolved — rather than making them dig through a separate panel to
        // find out their question was answered.
        const askedByThisUser = (q) =>
          chatMessages.some((m) => m.type === 'user' && m.text.trim().toLowerCase() === q.trim().toLowerCase());

        const relevantResolutions = result.resolved.filter((r) => askedByThisUser(r.question));

        if (relevantResolutions.length > 0) {
          setChatMessages((prev) => [
            ...prev,
            ...relevantResolutions.map((r) => ({
              type: 'ai',
              text: `Following up on what you asked earlier — "${r.question}"\n\n${r.answer}`,
              subject: null,
              sourceUrl: r.sourceUrl,
              synced: true,
              timestamp: nowStr(),
            })),
          ]);
        }

        showToast(
          `Sync complete! ${result.resolvedCount} question${result.resolvedCount > 1 ? 's' : ''} answered and saved permanently on the Village Hub \u2014 available offline from now on.`,
          { icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> }
        );
      } else if (result.stillPendingCount > 0) {
        showToast(
          `Sync ran, but ${result.stillPendingCount} question${result.stillPendingCount > 1 ? 's' : ''} couldn't be looked up (no internet reachable right now) — will retry next sync.`,
          { icon: <Clock className="w-6 h-6 text-amber-500" /> }
        );
      } else {
        showToast('Sync complete! New content downloaded from Village Hub.', {
          icon: <Zap className="w-6 h-6 text-teal-600" />,
        });
      }
      return;
    } catch {
      // Backend unreachable — fall back to resolving the local queue with search links only.
    }

    const unresolvedCount = pendingQuestions.filter((p) => p.status === 'pending').length;
    setPendingQuestions((prevQ) =>
      prevQ.map((p) =>
        p.status === 'pending' ? { ...p, status: 'resolved', resolvedAt: new Date().toISOString() } : p
      )
    );

    if (unresolvedCount > 0) {
      showToast(
        `Sync complete! ${unresolvedCount} queued question${unresolvedCount > 1 ? 's' : ''} looked up online — check the AI Tutor tab.`,
        { icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> }
      );
    } else {
      showToast('Sync complete! New content downloaded from Village Hub.', {
        icon: <Zap className="w-6 h-6 text-teal-600" />,
      });
    }
  };

  // ---------- Hub connection toggle (presenter-controlled) ----------
  const toggleHubConnection = () => {
    setHubConnected((prev) => {
      const next = !prev;
      showToast(
        next ? 'Village Hub connection established (local Wi-Fi).' : 'Out of Village Hub range — app continues working from local cache.',
        { icon: next ? <Wifi className="w-6 h-6 text-green-600" /> : <WifiOff className="w-6 h-6 text-red-500" /> }
      );
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 to-orange-800 text-amber-50 shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="w-8 h-8 animate-pulse" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${hubConnected ? 'bg-green-400 animate-ping' : 'bg-red-400'}`} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Edu-Sync Mesh</h1>
                <p className="text-xs text-amber-200">Offline-First Learning</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleHubConnection}
                title="Click to simulate moving in/out of Village Hub range"
                className="flex items-center gap-2 bg-amber-800 hover:bg-amber-700 transition px-4 py-2 rounded-full"
              >
                {hubConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-300" />
                    <span className="text-sm font-semibold">Village Hub Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-300" />
                    <span className="text-sm font-semibold">Out of Range</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 bg-yellow-600 px-4 py-2 rounded-full shadow-lg">
                <Award className="w-5 h-5 text-yellow-200" />
                <span className="text-lg font-bold">{eduCoins}</span>
                <span className="text-xs text-yellow-200">Edu-Coins</span>
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-amber-800 rounded-lg transition"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Header Stats */}
          <div className="md:hidden mt-3 flex gap-2">
            <button
              onClick={toggleHubConnection}
              className="flex-1 flex items-center gap-2 bg-amber-800 px-3 py-2 rounded-lg"
            >
              {hubConnected ? (
                <><Wifi className="w-4 h-4 text-green-300" /><span className="text-xs">Hub Connected</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-red-300" /><span className="text-xs">Out of Range</span></>
              )}
            </button>
            <div className="flex items-center gap-2 bg-yellow-600 px-3 py-2 rounded-lg">
              <Award className="w-4 h-4" />
              <span className="font-bold">{eduCoins}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-amber-900 text-white p-4 shadow-xl">
          <nav className="space-y-2">
            <button onClick={() => { setActiveTab('home'); setMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'home' ? 'bg-amber-700' : 'hover:bg-amber-800'}`}>
              <Home className="w-5 h-5" /><span>Home</span>
            </button>
            <button onClick={() => { setActiveTab('library'); setMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'library' ? 'bg-amber-700' : 'hover:bg-amber-800'}`}>
              <Library className="w-5 h-5" /><span>Library</span>
            </button>
            <button onClick={() => { setActiveTab('tutor'); setMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'tutor' ? 'bg-amber-700' : 'hover:bg-amber-800'}`}>
              <MessageSquare className="w-5 h-5" /><span>AI Tutor</span>
            </button>
            <button onClick={() => { setActiveTab('share'); setMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'share' ? 'bg-amber-700' : 'hover:bg-amber-800'}`}>
              <Users className="w-5 h-5" /><span>Share</span>
            </button>
            <button onClick={() => { setActiveTab('hub'); setMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'hub' ? 'bg-amber-700' : 'hover:bg-amber-800'}`}>
              <Server className="w-5 h-5" /><span>Hub Test Mode</span>
            </button>
            <button onClick={() => { setActiveTab('teacher'); setMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'teacher' ? 'bg-amber-700' : 'hover:bg-amber-800'}`}>
              <UploadCloud className="w-5 h-5" /><span>Teacher Upload</span>
            </button>
          </nav>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 space-y-3">
            <nav className="bg-white rounded-2xl shadow-xl p-4 space-y-2">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'library', label: 'My Library', icon: Library },
                { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
                { id: 'share', label: 'P2P Share', icon: Users },
                { id: 'hub', label: 'Hub Test Mode', icon: Server },
                { id: 'teacher', label: 'Teacher Upload', icon: UploadCloud },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                      : 'hover:bg-orange-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Sync Box */}
            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" />
                <h3 className="font-bold text-lg">Data Mule Sync</h3>
              </div>
              <p className="text-sm text-green-100 mb-4">
                Sync via teacher&apos;s phone or a USB flash drive carried on the daily commuter omnibus to town
              </p>
              <button
                onClick={simulateSync}
                disabled={syncing}
                className="w-full bg-white text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {syncing && <Loader2 className="w-4 h-4 animate-spin" />}
                {syncing ? 'Syncing…' : 'Start Sync'}
              </button>
              {syncProgress > 0 && (
                <div className="mt-3">
                  <div className="bg-green-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center mt-2">{syncProgress}% complete</p>
                </div>
              )}
              <p className="text-xs text-green-100 mt-3 text-center">Last synced: {lastSynced}</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'home' && (
              <HomeTab lessons={lessons} setViewingLesson={setViewingLesson} showToast={showToast} />
            )}

            {activeTab === 'library' && (
              <LibraryTab
                lessons={lessons}
                setViewingLesson={setViewingLesson}
                showToast={showToast}
                handleShareContent={handleShareContent}
                handleDownloadFromHub={handleDownloadFromHub}
              />
            )}

            {activeTab === 'tutor' && (
              <AITutorTab
                backendOnline={backendOnline}
                hubQA={hubQA}
                pendingQuestions={pendingQuestions}
                chatMessages={chatMessages}
                isAITyping={isAITyping}
                userInput={userInput}
                setUserInput={setUserInput}
                handleSendMessage={handleSendMessage}
                askTutor={askTutor}
                recheckBackend={recheckBackend}
                chatEndRef={chatEndRef}
              />
            )}

            {activeTab === 'share' && (
              <P2PShareTab
                sharedContent={sharedContent}
                sharedCount={sharedCount}
                downloadedCount={downloadedCount}
                eduCoins={eduCoins}
                handleDownloadShared={handleDownloadShared}
              />
            )}

            {activeTab === 'hub' && <HubTestMode />}

            {activeTab === 'teacher' && (
              <TeacherUpload
                backendOnline={backendOnline}
                onUploaded={handleLessonUploaded}
                showToast={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {viewingLesson && (
        <LessonModal
          lesson={viewingLesson}
          onClose={() => setViewingLesson(null)}
          onComplete={handleCompleteLesson}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-2xl z-40">
        <div className="flex justify-around py-2">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'library', label: 'Library', icon: Library },
            { id: 'tutor', label: 'Tutor', icon: MessageSquare },
            { id: 'share', label: 'Share', icon: Users },
            { id: 'hub', label: 'Hub', icon: Server },
            { id: 'teacher', label: 'Upload', icon: UploadCloud },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                activeTab === id ? 'text-orange-600' : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function inferSubject(title) {
  const t = title.toLowerCase();
  const map = [
    ['math', 'Maths'], ['maths', 'Maths'],
    ['chemistry', 'Chemistry'],
    ['biology', 'Biology'],
    ['physics', 'Physics'],
    ['english', 'English'],
    ['shona', 'Shona'],
    ['geography', 'Geography'],
    ['history', 'History'],
    ['commerce', 'Commerce'], ['accounting', 'Commerce'], ['business', 'Commerce'],
  ];
  const found = map.find(([keyword]) => t.includes(keyword));
  return found ? found[1] : 'General';
}

function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}