import React, { useState, useEffect, useRef } from 'react';
import { Send, Wifi, WifiOff, Download, Upload, Users, BookOpen, Award, Zap, Radio, MessageSquare, FileText, ChevronRight, Home, Library, Trophy, Settings, Menu, X } from 'lucide-react';

export default function EduSyncMesh() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [eduCoins, setEduCoins] = useState(47);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [sharedContent, setSharedContent] = useState([
    { id: 1, title: 'ZIMSEC Maths O-Level Module 3', size: '12MB', sharedBy: 'Tendai M.', coins: 5 },
    { id: 2, title: 'English Literature: Poetry Analysis', size: '8MB', sharedBy: 'Chipo K.', coins: 3 }
  ]);
  const [menuOpen, setMenuOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Simulate network status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(prev => Math.random() > 0.7 ? !prev : prev);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const lessons = [
    { 
      id: 1, 
      title: 'Mathematics - Quadratic Equations', 
      subject: 'Maths', 
      size: '15MB',
      downloaded: true,
      progress: 100 
    },
    { 
      id: 2, 
      title: 'Chemistry - Periodic Table', 
      subject: 'Chemistry', 
      size: '22MB',
      downloaded: false,
      progress: 0 
    },
    { 
      id: 3, 
      title: 'Shona - Mabviro Nemauto', 
      subject: 'Shona', 
      size: '8MB',
      downloaded: true,
      progress: 100 
    },
    { 
      id: 4, 
      title: 'Biology - Cell Structure', 
      subject: 'Biology', 
      size: '18MB',
      downloaded: true,
      progress: 100 
    }
  ];

  const simulateAIResponse = (query) => {
    setIsAITyping(true);
    
    setTimeout(() => {
      let response = '';
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('quadratic') || lowerQuery.includes('maths')) {
        response = 'Quadratic equation formula yekuti: x = (-b ± √(b²-4ac)) / 2a. Ini ndinogona kukubatsira nekuzvishandisa. Woita example here?';
      } else if (lowerQuery.includes('biology') || lowerQuery.includes('cell')) {
        response = 'Cell ine zvikamu zvitatu zvikuru: nucleus (inochengeta DNA), cytoplasm (mahwere emukati), uye membrane (chigubiso chekunze). Unoda kuziva zvimwe here?';
      } else if (lowerQuery.includes('shona') || lowerQuery.includes('mabviro')) {
        response = 'Mabviro Nemauto ibhuku rakanyorwa naStanlake Samkange. Rinotaura nezve historia yeZimbabwe. Unoda summary yemuchapter upi?';
      } else {
        response = `Ndakanzwa mubvunzo wako pamusoro pe "${query}". Ndinogona kukubatsira nekuzvidzidza. Ndingakuwedzerawo here?`;
      }
      
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: response,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAITyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    setChatMessages(prev => [...prev, { 
      type: 'user', 
      text: userInput,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }]);
    
    simulateAIResponse(userInput);
    setUserInput('');
  };

  const handleShareContent = (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson && lesson.downloaded) {
      setEduCoins(prev => prev + 5);
      alert(`Sharing "${lesson.title}" via Wi-Fi Direct! You earned 5 Edu-Coins! 🎉`);
    }
  };

  const simulateSync = () => {
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          alert('Sync complete! New content downloaded from Village Hub. 📚');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
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
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Edu-Sync Mesh</h1>
                <p className="text-xs text-amber-200">Offline-First Learning</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-800 px-4 py-2 rounded-full">
                {isOnline ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-300" />
                    <span className="text-sm font-semibold">Village Hub Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-300" />
                    <span className="text-sm font-semibold">Offline Mode</span>
                  </>
                )}
              </div>
              
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
            <div className="flex-1 flex items-center gap-2 bg-amber-800 px-3 py-2 rounded-lg">
              {isOnline ? (
                <><Wifi className="w-4 h-4 text-green-300" /><span className="text-xs">Online</span></>
              ) : (
                <><WifiOff className="w-4 h-4 text-red-300" /><span className="text-xs">Offline</span></>
              )}
            </div>
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
            <button onClick={() => { setActiveTab('home'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 bg-amber-800 rounded-lg hover:bg-amber-700 transition">
              <Home className="w-5 h-5" /><span>Home</span>
            </button>
            <button onClick={() => { setActiveTab('library'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-800 rounded-lg transition">
              <Library className="w-5 h-5" /><span>Library</span>
            </button>
            <button onClick={() => { setActiveTab('tutor'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-800 rounded-lg transition">
              <MessageSquare className="w-5 h-5" /><span>AI Tutor</span>
            </button>
            <button onClick={() => { setActiveTab('share'); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-800 rounded-lg transition">
              <Users className="w-5 h-5" /><span>Share</span>
            </button>
          </nav>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 space-y-3">
            <nav className="bg-white rounded-2xl shadow-xl p-4 space-y-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'home' 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                    : 'hover:bg-orange-100 text-gray-700'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              
              <button
                onClick={() => setActiveTab('library')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'library' 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                    : 'hover:bg-orange-100 text-gray-700'
                }`}
              >
                <Library className="w-5 h-5" />
                <span>My Library</span>
              </button>
              
              <button
                onClick={() => setActiveTab('tutor')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'tutor' 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                    : 'hover:bg-orange-100 text-gray-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>AI Tutor</span>
              </button>
              
              <button
                onClick={() => setActiveTab('share')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'share' 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                    : 'hover:bg-orange-100 text-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>P2P Share</span>
              </button>
            </nav>

            {/* Sync Box */}
            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" />
                <h3 className="font-bold text-lg">Data Mule Sync</h3>
              </div>
              <p className="text-sm text-green-100 mb-4">
                Sync with Village Hub when teacher returns from town
              </p>
              <button 
                onClick={simulateSync}
                className="w-full bg-white text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition shadow-lg"
              >
                Start Sync
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
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'home' && (
              <div className="space-y-6">
                {/* Hero Card */}
                <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />
                  
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black mb-3">
                      Learn Without Limits
                    </h2>
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

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <WifiOff className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Offline-First</h3>
                    <p className="text-gray-600">
                      All lessons stored locally. Learn anytime, anywhere—no data needed.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">AI Tutor in Shona</h3>
                    <p className="text-gray-600">
                      Ask questions in Shona or English. Get instant answers from local AI.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Peer Sharing</h3>
                    <p className="text-gray-600">
                      Share lessons via Wi-Fi Direct. Earn Edu-Coins with every share!
                    </p>
                  </div>
                </div>

                {/* Recent Lessons */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                    Continue Learning
                  </h3>
                  <div className="space-y-3">
                    {lessons.slice(0, 3).map(lesson => (
                      <div key={lesson.id} className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition cursor-pointer">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {lesson.subject[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{lesson.subject} • {lesson.size}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'library' && (
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
                    {lessons.map(lesson => (
                      <div key={lesson.id} className="border-2 border-orange-200 rounded-2xl p-5 hover:border-orange-400 transition bg-gradient-to-r from-white to-orange-50">
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl ${
                            lesson.downloaded 
                              ? 'bg-gradient-to-br from-green-500 to-teal-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {lesson.subject[0]}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{lesson.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {lesson.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {lesson.size}
                              </span>
                            </div>
                            
                            {lesson.downloaded ? (
                              <div className="flex flex-wrap gap-2">
                                <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
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
                            ) : (
                              <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed">
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
            )}

            {activeTab === 'tutor' && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <MessageSquare className="w-7 h-7" />
                    AI Tutor - Offline Mode
                  </h2>
                  <p className="text-purple-200 text-sm mt-1">Ask in Shona or English • No internet needed</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-purple-50 to-white">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Start Learning!</h3>
                      <p className="text-gray-600 mb-4">Ask me anything about your ZIMSEC subjects</p>
                      <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        <button 
                          onClick={() => {
                            setUserInput('Explain quadratic equations');
                            setTimeout(() => handleSendMessage(), 100);
                          }}
                          className="p-4 bg-purple-100 rounded-xl hover:bg-purple-200 transition text-left"
                        >
                          <p className="font-semibold text-purple-900">How do quadratic equations work?</p>
                        </button>
                        <button 
                          onClick={() => {
                            setUserInput('Ndoda kubatsirwa nebiology');
                            setTimeout(() => handleSendMessage(), 100);
                          }}
                          className="p-4 bg-purple-100 rounded-xl hover:bg-purple-200 transition text-left"
                        >
                          <p className="font-semibold text-purple-900">Ndoda kubatsirwa nebiology</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md ${msg.type === 'user' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' : 'bg-purple-100 text-gray-800'} rounded-2xl px-5 py-3 shadow-lg`}>
                        <p className="text-sm mb-1">{msg.text}</p>
                        <p className={`text-xs ${msg.type === 'user' ? 'text-orange-200' : 'text-purple-600'}`}>
                          {msg.timestamp}
                        </p>
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your question... (e.g., 'Explain photosynthesis' or 'Batsira nebiology')"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:outline-none text-gray-800"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    🔒 All AI processing happens locally on Village Hub • Zero data cost
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'share' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-3xl font-black text-gray-800 mb-2 flex items-center gap-2">
                    <Users className="w-8 h-8 text-green-600" />
                    Peer-to-Peer Sharing
                  </h2>
                  <p className="text-gray-600 mb-6">Share lessons via Wi-Fi Direct and earn Edu-Coins! No internet needed.</p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white">
                      <Upload className="w-10 h-10 mb-3" />
                      <h3 className="text-xl font-bold mb-2">Your Shared Content</h3>
                      <p className="text-3xl font-black mb-1">14 items</p>
                      <p className="text-green-200 text-sm">Earned 70 Edu-Coins this week</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                      <Download className="w-10 h-10 mb-3" />
                      <h3 className="text-xl font-bold mb-2">Downloaded from Peers</h3>
                      <p className="text-3xl font-black mb-1">8 items</p>
                      <p className="text-blue-200 text-sm">Saved approximately $2.40 in data</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-4">Available from Nearby Students</h3>
                  <div className="space-y-4">
                    {sharedContent.map(item => (
                      <div key={item.id} className="border-2 border-green-200 rounded-2xl p-5 hover:border-green-400 transition bg-gradient-to-r from-white to-green-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Shared by {item.sharedBy}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {item.size}
                              </span>
                              <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                                <Award className="w-4 h-4" />
                                +{item.coins} coins to share
                              </span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition whitespace-nowrap">
                            Download via Wi-Fi Direct
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
                  <Trophy className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Leaderboard - Top Sharers This Month</h3>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <span className="font-semibold">1. Tendai M.</span>
                      <span className="font-bold">234 Edu-Coins</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <span className="font-semibold">2. Chipo K.</span>
                      <span className="font-bold">189 Edu-Coins</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <span className="font-semibold">3. You</span>
                      <span className="font-bold">47 Edu-Coins</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-2xl z-40">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              activeTab === 'home' ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              activeTab === 'library' ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <Library className="w-6 h-6" />
            <span className="text-xs font-semibold">Library</span>
          </button>
          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              activeTab === 'tutor' ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs font-semibold">Tutor</span>
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              activeTab === 'share' ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-semibold">Share</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
