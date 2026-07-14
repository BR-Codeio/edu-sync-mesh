import React from 'react';
import { Users, Upload, Download, FileText, Award, Loader2, CheckCircle2, Trophy } from 'lucide-react';

export default function P2PShareTab({ sharedContent, sharedCount, downloadedCount, eduCoins, handleDownloadShared }) {
  return (
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
            <p className="text-3xl font-black mb-1">{sharedCount} items</p>
            <p className="text-green-200 text-sm">Earned {eduCoins} Edu-Coins so far</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <Download className="w-10 h-10 mb-3" />
            <h3 className="text-xl font-bold mb-2">Downloaded from Peers</h3>
            <p className="text-3xl font-black mb-1">{downloadedCount} items</p>
            <p className="text-blue-200 text-sm">Saved approximately ${(downloadedCount * 0.3).toFixed(2)} in data</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Available from Nearby Students</h3>
        <div className="space-y-4">
          {sharedContent.map((item) => (
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
                      <Award className="w-4 h-4" />+{item.coins} coins to share
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadShared(item.id)}
                  disabled={item.downloading || item.downloaded}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                    item.downloaded ? 'bg-green-100 text-green-700 cursor-default' : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-80`}
                >
                  {item.downloading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {item.downloaded && <CheckCircle2 className="w-4 h-4" />}
                  {item.downloaded ? 'Downloaded' : item.downloading ? 'Transferring…' : 'Download via Wi-Fi Direct'}
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
            <span className="font-bold">{eduCoins} Edu-Coins</span>
          </div>
        </div>
      </div>
    </div>
  );
}