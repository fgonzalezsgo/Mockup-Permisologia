import { useState } from 'react';
import { Shield, UserCog, History, Users, FileEdit } from 'lucide-react';
import { motion } from 'motion/react';
import { UserPermissions } from './UserPermissions';
import { PermissionProfiles } from './PermissionProfiles';
import { AuditHistory } from './AuditHistory';
import { DraftEditor } from './DraftEditor';

export function PermissionSystem() {
  const [activeTab, setActiveTab] = useState<'users' | 'profiles' | 'drafts' | 'audit'>('users');

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Main Header */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                Sistema de Gestión de Permisos
              </h1>
              <p className="text-[#6b7280]">
                Administración y auditoría de accesos
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`
                relative px-1 py-4 transition-colors flex items-center gap-2
                ${activeTab === 'users' ? 'text-[#4f46e5]' : 'text-[#6b7280] hover:text-[#1f2937]'}
              `}
              style={{ fontWeight: 500 }}
            >
              <Users className="w-4 h-4" />
              Permisos por Usuario
              {activeTab === 'users' && (
                <motion.div
                  layoutId="activeMainTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`
                relative px-1 py-4 transition-colors flex items-center gap-2
                ${activeTab === 'profiles' ? 'text-[#4f46e5]' : 'text-[#6b7280] hover:text-[#1f2937]'}
              `}
              style={{ fontWeight: 500 }}
            >
              <UserCog className="w-4 h-4" />
              Perfiles de Permisos
              {activeTab === 'profiles' && (
                <motion.div
                  layoutId="activeMainTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5]"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              className={`
                relative px-1 py-4 transition-colors flex items-center gap-2
                ${activeTab === 'drafts' ? 'text-[#4f46e5]' : 'text-[#6b7280] hover:text-[#1f2937]'}
              `}
              style={{ fontWeight: 500 }}
            >
              <FileEdit className="w-4 h-4" />
              Editor de Borradores
              {activeTab === 'drafts' && (
                <motion.div
                  layoutId="activeMainTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5]"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`
                relative px-1 py-4 transition-colors flex items-center gap-2
                ${activeTab === 'audit' ? 'text-[#4f46e5]' : 'text-[#6b7280] hover:text-[#1f2937]'}
              `}
              style={{ fontWeight: 500 }}
            >
              <History className="w-4 h-4" />
              Historial de Auditoría
              {activeTab === 'audit' && (
                <motion.div
                  layoutId="activeMainTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5]"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === 'users' ? (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <UserPermissions />
          </motion.div>
        ) : activeTab === 'profiles' ? (
          <motion.div
            key="profiles"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PermissionProfiles />
          </motion.div>
        ) : activeTab === 'drafts' ? (
          <motion.div
            key="drafts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DraftEditor />
          </motion.div>
        ) : (
          <motion.div
            key="audit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AuditHistory />
          </motion.div>
        )}
      </div>
    </div>
  );
}

