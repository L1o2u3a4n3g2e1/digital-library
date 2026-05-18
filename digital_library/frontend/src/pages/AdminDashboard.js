import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBook, FiUpload, FiActivity, FiTrash2, FiEdit2, FiCheck, FiX, FiShield } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import { MOCK_BOOKS } from '../data/mockData';

const MOCK_USERS = [
  { id: 1, name: 'Anne Louange', email: 'yasriyag9@gmail.com', role: 'admin', books: 14, joined: '2024-01-15', active: true },
  { id: 2, name: 'Jean-Paul Murera', email: 'jp@example.com', role: 'user', books: 6, joined: '2024-02-20', active: true },
  { id: 3, name: 'Amina Diallo', email: 'amina@example.com', role: 'user', books: 23, joined: '2024-03-01', active: false },
  { id: 4, name: 'Samuel Nkurunziza', email: 'sam@example.com', role: 'user', books: 11, joined: '2024-03-15', active: true },
];

const StatCard = ({ icon: Icon, value, label, trend, color }) => (
  <motion.div whileHover={{ y: -3 }} className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend && <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{trend > 0 ? '+' : ''}{trend}%</span>}
    </div>
    <p className="text-2xl font-['Playfair_Display'] font-bold text-[#4A3628]">{value}</p>
    <p className="text-xs text-[#9E8E80] mt-0.5">{label}</p>
  </motion.div>
);

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState(MOCK_USERS);
  const [books, setBooks] = useState(MOCK_BOOKS);

  const toggleUser = (id) => setUsers(us => us.map(u => u.id === id ? { ...u, active: !u.active } : u));
  const deleteBook = (id) => setBooks(bs => bs.filter(b => b.id !== id));

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EDD9CB] flex items-center justify-center">
            <FiShield size={18} className="text-[#8B6F5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-['Playfair_Display'] font-bold text-[#4A3628]">Admin Dashboard</h1>
            <p className="text-sm text-[#9E8E80]">Manage your library platform</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} value={MOCK_USERS.length} label="Total Users" trend={12} color="#8B6F5A" />
          <StatCard icon={FiBook} value={MOCK_BOOKS.length} label="Total Books" trend={8} color="#B08968" />
          <StatCard icon={FiUpload} value="2" label="Pending Review" trend={null} color="#D4A574" />
          <StatCard icon={FiActivity} value="50K" label="Monthly Reads" trend={23} color="#C9A882" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-[#EDD9CB]">
          {[['overview', '📊 Overview'], ['users', '👤 Users'], ['books', '📚 Books']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === v ? 'bg-[#8B6F5A] text-white' : 'text-[#9E8E80] hover:bg-[#F8F4EE]'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-[#4A3628] mb-4">Books by Language</h3>
              {[{ lang: '🇬🇧 English', count: 4, pct: 50 }, { lang: '🇫🇷 Français', count: 2, pct: 25 }, { lang: '🇰🇪 Kiswahili', count: 1, pct: 12.5 }, { lang: '🇷🇼 Kinyarwanda', count: 1, pct: 12.5 }].map((l, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-[#6B5044] w-32 flex-shrink-0">{l.lang}</span>
                  <div className="flex-1 h-2 bg-[#EDD9CB] rounded-full"><motion.div initial={{ width: 0 }} animate={{ width: `${l.pct}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} className="h-full bg-[#8B6F5A] rounded-full" /></div>
                  <span className="text-xs text-[#9E8E80] w-8 text-right">{l.count}</span>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-[#4A3628] mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { icon: '📤', text: 'New book uploaded: "Atomic Habits"', time: '2m ago' },
                  { icon: '👤', text: 'New user registered: Samuel N.', time: '15m ago' },
                  { icon: '🎧', text: 'Audio generated for "Sapiens"', time: '1h ago' },
                  { icon: '🌍', text: 'Translation complete: EN → RW', time: '2h ago' },
                  { icon: '⭐', text: 'Book review: "The Alchemist" (5★)', time: '3h ago' },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8F4EE] transition-colors">
                    <span className="text-base flex-shrink-0">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#4A3628] truncate">{a.text}</p>
                      <p className="text-xs text-[#C4B0A0]">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[#EDD9CB] bg-[#FDFCFA]">
                  {['User', 'Role', 'Books', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-[#9E8E80] px-5 py-4 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-[#F8F4EE] hover:bg-[#FDFCFA] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D8BFAA] to-[#B08968] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{u.name.charAt(0)}</div>
                          <div><p className="text-sm font-medium text-[#4A3628]">{u.name}</p><p className="text-xs text-[#9E8E80]">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className={`badge ${u.role === 'admin' ? 'bg-[#EDD9CB] text-[#8B6F5A]' : 'bg-[#F8F4EE] text-[#9E8E80]'}`}>{u.role}</span></td>
                      <td className="px-5 py-4 text-sm text-[#6B5044]">{u.books}</td>
                      <td className="px-5 py-4 text-sm text-[#9E8E80]">{u.joined}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => toggleUser(u.id)} className="p-1.5 rounded-lg text-[#C4B0A0] hover:text-[#8B6F5A] hover:bg-[#F8F4EE] transition-colors">
                            {u.active ? <FiX size={14} /> : <FiCheck size={14} />}
                          </button>
                          <button className="p-1.5 rounded-lg text-[#C4B0A0] hover:text-[#8B6F5A] hover:bg-[#F8F4EE] transition-colors"><FiEdit2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Books tab */}
        {tab === 'books' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[#EDD9CB] bg-[#FDFCFA]">
                  {['Book', 'Language', 'Category', 'Rating', 'Readers', 'Audio', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-[#9E8E80] px-5 py-4 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {books.map((b, i) => (
                    <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-[#F8F4EE] hover:bg-[#FDFCFA] transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#4A3628] truncate max-w-[180px]">{b.title}</p>
                          <p className="text-xs text-[#9E8E80]">{b.author}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#6B5044] uppercase">{b.language}</td>
                      <td className="px-5 py-4"><span className="badge bg-[#F8F4EE] text-[#8B6F5A]">{b.category}</span></td>
                      <td className="px-5 py-4 text-sm font-medium text-[#B08968]">⭐ {b.rating}</td>
                      <td className="px-5 py-4 text-sm text-[#9E8E80]">{(b.readers / 1000).toFixed(1)}K</td>
                      <td className="px-5 py-4"><span className={`badge ${b.hasAudio ? 'bg-green-100 text-green-700' : 'bg-[#F8F4EE] text-[#C4B0A0]'}`}>{b.hasAudio ? 'Yes' : 'No'}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded-lg text-[#C4B0A0] hover:text-[#8B6F5A] hover:bg-[#F8F4EE] transition-colors"><FiEdit2 size={14} /></button>
                          <button onClick={() => deleteBook(b.id)} className="p-1.5 rounded-lg text-[#C4B0A0] hover:text-red-500 hover:bg-red-50 transition-colors"><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
