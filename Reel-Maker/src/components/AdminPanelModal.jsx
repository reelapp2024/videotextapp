import React from 'react';
import { Shield, X, UserPlus, Users, Plus, Loader2, Zap, Edit2, Check, Power, Trash2 } from 'lucide-react';

export default function AdminPanelModal({
  show,
  onClose,
  adminStats,
  adminUsers,
  adminNewEmail,
  setAdminNewEmail,
  adminNewPassword,
  setAdminNewPassword,
  adminNewName,
  setAdminNewName,
  adminNewRole,
  setAdminNewRole,
  adminCreateUser,
  adminLoading,
  loadAdminData,
  adminEditId,
  setAdminEditId,
  adminEditData,
  setAdminEditData,
  adminSaveEdit,
  adminToggleActive,
  adminDeleteUser,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-gradient-to-b from-[#111730] to-[#0c1022] border border-indigo-500/[0.1] rounded-2xl shadow-2xl shadow-indigo-950/40 my-4 sm:my-8 overflow-hidden ring-1 ring-white/[0.03]">
        {/* Admin Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-600/20 to-orange-600/10 border-b border-indigo-500/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-[10px] sm:text-xs text-gray-400">Manage users and accounts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] flex items-center justify-center transition border border-indigo-500/[0.08]"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Stats */}
          {adminStats && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
              {[
                { label: 'Total Users', value: adminStats.totalUsers, color: 'text-indigo-400' },
                { label: 'Active', value: adminStats.activeUsers, color: 'text-emerald-400' },
                { label: 'Admins', value: adminStats.adminCount, color: 'text-amber-400' },
              ].map((s, i) => (
                <div key={i} className="bg-indigo-500/[0.05] rounded-xl px-3 py-2 sm:py-2.5 text-center border border-indigo-500/[0.06]">
                  <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create User Form */}
        <div className="p-4 sm:p-6 border-b border-indigo-500/[0.08]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-emerald-400" /> Create New User
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={adminNewEmail}
              onChange={(e) => setAdminNewEmail(e.target.value)}
              className="bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:border-indigo-500/50 outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={adminNewPassword}
              onChange={(e) => setAdminNewPassword(e.target.value)}
              className="bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:border-indigo-500/50 outline-none transition"
            />
            <input
              type="text"
              placeholder="Name"
              value={adminNewName}
              onChange={(e) => setAdminNewName(e.target.value)}
              className="bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:border-indigo-500/50 outline-none transition"
            />
            <div className="flex gap-2">
              <select
                value={adminNewRole}
                onChange={(e) => setAdminNewRole(e.target.value)}
                className="flex-1 bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-indigo-500/50 outline-none transition"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={adminCreateUser}
                disabled={adminLoading || !adminNewEmail || !adminNewPassword}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              >
                {adminLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> All Users ({adminUsers.length})
            </h3>
            <button
              onClick={loadAdminData}
              disabled={adminLoading}
              className="text-[10px] px-2.5 py-1 bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] text-gray-400 rounded-lg transition flex items-center gap-1 border border-indigo-500/[0.06]"
            >
              {adminLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Refresh
            </button>
          </div>

          {/* Mobile-friendly user cards */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {adminUsers.map((u) => (
              <div
                key={u._id}
                className={`rounded-xl border p-3 transition ${
                  u.active === false
                    ? 'bg-red-900/5 border-red-500/10'
                    : u.role === 'admin'
                      ? 'bg-amber-900/5 border-amber-500/10'
                      : 'bg-indigo-500/[0.03] border-indigo-500/[0.08]'
                }`}
              >
                {adminEditId === u._id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={adminEditData.name ?? u.name}
                        onChange={(e) => setAdminEditData((p) => ({ ...p, name: e.target.value }))}
                        className="bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={adminEditData.email ?? u.email}
                        onChange={(e) => setAdminEditData((p) => ({ ...p, email: e.target.value }))}
                        className="bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none"
                      />
                      <input
                        type="password"
                        placeholder="New password (leave blank to keep)"
                        onChange={(e) => setAdminEditData((p) => ({ ...p, password: e.target.value || undefined }))}
                        className="bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none placeholder-gray-600"
                      />
                      <select
                        value={adminEditData.role ?? u.role}
                        onChange={(e) => setAdminEditData((p) => ({ ...p, role: e.target.value }))}
                        className="bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setAdminEditId(null); setAdminEditData({}); }}
                        className="text-[10px] px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => adminSaveEdit(u._id)}
                        className="text-[10px] px-3 py-1.5 bg-indigo-600 hover:bg-violet-500 text-white rounded-lg transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        u.role === 'admin' ? 'bg-amber-500/15' : 'bg-violet-500/15'
                      }`}>
                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <Users className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-medium text-white truncate">{u.name || 'No name'}</p>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                            u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-violet-500/15 text-indigo-300'
                          }`}>{u.role}</span>
                          {u.active === false && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">Disabled</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setAdminEditId(u._id); setAdminEditData({}); }}
                        className="w-7 h-7 rounded-lg bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] flex items-center justify-center transition border border-indigo-500/[0.06]"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3 text-gray-400" />
                      </button>
                      <button
                        onClick={() => adminToggleActive(u._id, u.active !== false)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                          u.active !== false ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : 'bg-red-500/10 hover:bg-red-500/20'
                        }`}
                        title={u.active !== false ? 'Deactivate' : 'Activate'}
                      >
                        <Power className={`w-3 h-3 ${u.active !== false ? 'text-emerald-400' : 'text-red-400'}`} />
                      </button>
                      <button
                        onClick={() => adminDeleteUser(u._id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {adminUsers.length === 0 && !adminLoading && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

