import { useState } from 'react';
import { History, Search, Filter, User, Clock, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuditEntry {
  id: string;
  timestamp: string;
  date: string;
  actionType: 'grant' | 'revoke' | 'modify' | 'profile_change';
  performedBy: {
    name: string;
    run: string;
    role: string;
    avatar: string;
    avatarColor: string;
  };
  affectedUser: {
    name: string;
    run: string;
  };
  book?: string;
  permission?: string;
  oldValue?: string;
  newValue?: string;
  profileChange?: {
    from: string;
    to: string;
  };
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    timestamp: '14:23',
    date: '2026-04-16',
    actionType: 'modify',
    performedBy: {
      name: 'Roberto Silva',
      run: '15678234K',
      role: 'Administrador Plataforma',
      avatar: 'RS',
      avatarColor: '#4f46e5'
    },
    affectedUser: {
      name: 'Laura Pérez Moreno',
      run: '78945612E'
    },
    book: 'Libro de Obra Maestro',
    permission: 'Escritura',
    oldValue: 'Denegado',
    newValue: 'Permitido'
  },
  {
    id: '2',
    timestamp: '12:15',
    date: '2026-04-16',
    actionType: 'profile_change',
    performedBy: {
      name: 'Roberto Silva',
      run: '15678234K',
      role: 'Administrador Plataforma',
      avatar: 'RS',
      avatarColor: '#4f46e5'
    },
    affectedUser: {
      name: 'Carlos Sánchez Gil',
      run: '45678912C'
    },
    profileChange: {
      from: 'Visualizador',
      to: 'Consultor'
    }
  },
  {
    id: '3',
    timestamp: '10:45',
    date: '2026-04-16',
    actionType: 'grant',
    performedBy: {
      name: 'Patricia Morales',
      run: '18234567L',
      role: 'Equipo soporte',
      avatar: 'PM',
      avatarColor: '#0891b2'
    },
    affectedUser: {
      name: 'Ana Torres Vega',
      run: '32165498D'
    },
    book: 'Libro de Comunicaciones',
    permission: 'Toma de Conocimiento',
    oldValue: 'Denegado',
    newValue: 'Permitido'
  },
  {
    id: '4',
    timestamp: '09:30',
    date: '2026-04-16',
    actionType: 'revoke',
    performedBy: {
      name: 'Roberto Silva',
      run: '15678234K',
      role: 'Administrador Plataforma',
      avatar: 'RS',
      avatarColor: '#4f46e5'
    },
    affectedUser: {
      name: 'Juan Martínez Ruiz',
      run: '87654321B'
    },
    book: 'Libro de Especialidades',
    permission: 'Escritura',
    oldValue: 'Permitido',
    newValue: 'Denegado'
  },
  {
    id: '5',
    timestamp: '16:20',
    date: '2026-04-15',
    actionType: 'profile_change',
    performedBy: {
      name: 'Patricia Morales',
      run: '18234567L',
      role: 'Equipo soporte',
      avatar: 'PM',
      avatarColor: '#0891b2'
    },
    affectedUser: {
      name: 'María García López',
      run: '12345678A'
    },
    profileChange: {
      from: 'Consultor',
      to: 'Administrador Mandante'
    }
  },
  {
    id: '6',
    timestamp: '14:10',
    date: '2026-04-15',
    actionType: 'grant',
    performedBy: {
      name: 'Roberto Silva',
      run: '15678234K',
      role: 'Administrador Plataforma',
      avatar: 'RS',
      avatarColor: '#4f46e5'
    },
    affectedUser: {
      name: 'Laura Pérez Moreno',
      run: '78945612E'
    },
    book: 'Libro de Obra Maestro',
    permission: 'Lectura',
    oldValue: 'Denegado',
    newValue: 'Permitido'
  }
];

export function AuditHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getActionIcon = (type: AuditEntry['actionType']) => {
    switch (type) {
      case 'grant':
        return <CheckCircle className="w-5 h-5 text-[#16a34a]" />;
      case 'revoke':
        return <XCircle className="w-5 h-5 text-[#ef4444]" />;
      case 'modify':
        return <AlertCircle className="w-5 h-5 text-[#f59e0b]" />;
      case 'profile_change':
        return <Shield className="w-5 h-5 text-[#4f46e5]" />;
      default:
        return <History className="w-5 h-5 text-[#6b7280]" />;
    }
  };

  const getActionLabel = (type: AuditEntry['actionType']) => {
    switch (type) {
      case 'grant':
        return 'Permiso Otorgado';
      case 'revoke':
        return 'Permiso Revocado';
      case 'modify':
        return 'Permiso Modificado';
      case 'profile_change':
        return 'Cambio de Perfil';
      default:
        return 'Acción';
    }
  };

  const getActionColor = (type: AuditEntry['actionType']) => {
    switch (type) {
      case 'grant':
        return 'bg-[#dcfce7] text-[#166534]';
      case 'revoke':
        return 'bg-[#fee2e2] text-[#991b1b]';
      case 'modify':
        return 'bg-[#fef3c7] text-[#92400e]';
      case 'profile_change':
        return 'bg-[#eff6ff] text-[#1e40af]';
      default:
        return 'bg-[#f3f4f6] text-[#374151]';
    }
  };

  const filteredEntries = mockAuditEntries.filter((entry) => {
    const matchesType = filterType === 'all' || entry.actionType === filterType;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesType;

    const searchableFields = [
      entry.affectedUser.name,
      entry.affectedUser.run,
      entry.performedBy.name,
      entry.performedBy.run,
      entry.performedBy.role,
      entry.book || '',
      entry.permission || '',
      getActionLabel(entry.actionType),
      entry.profileChange?.from || '',
      entry.profileChange?.to || ''
    ];

    const matchesSearch = searchableFields.some(field => field.toLowerCase().includes(query));
    return matchesType && matchesSearch;
  });

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, AuditEntry[]>);

  const stats = {
    grant: filteredEntries.filter(entry => entry.actionType === 'grant').length,
    revoke: filteredEntries.filter(entry => entry.actionType === 'revoke').length,
    modify: filteredEntries.filter(entry => entry.actionType === 'modify').length,
    profile_change: filteredEntries.filter(entry => entry.actionType === 'profile_change').length
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                Historial de Auditoría
              </h1>
              <p className="text-[#6b7280]">
                Registro completo de cambios en permisos de usuarios
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por usuario, libro o acción..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              style={{ fontWeight: 500 }}
            >
              <option value="all">Todas las acciones</option>
              <option value="grant">Permisos otorgados</option>
              <option value="revoke">Permisos revocados</option>
              <option value="modify">Permisos modificados</option>
              <option value="profile_change">Cambios de perfil</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="p-3 bg-white border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors"
              title="Limpiar filtros"
            >
              <Filter className="w-5 h-5 text-[#6b7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#dcfce7] flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div className="text-2xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                {stats.grant}
              </div>
            </div>
            <div className="text-sm text-[#6b7280]">
              Permisos otorgados
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#fee2e2] flex items-center justify-center">
                <XCircle className="w-5 h-5 text-[#ef4444]" />
              </div>
              <div className="text-2xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                {stats.revoke}
              </div>
            </div>
            <div className="text-sm text-[#6b7280]">
              Permisos revocados
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#fef3c7] flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div className="text-2xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                {stats.modify}
              </div>
            </div>
            <div className="text-sm text-[#6b7280]">
              Permisos modificados
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-[#e1e4e8] p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#4f46e5]" />
              </div>
              <div className="text-2xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                {stats.profile_change}
              </div>
            </div>
            <div className="text-sm text-[#6b7280]">
              Cambios de perfil
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(groupedEntries).length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e1e4e8] p-8 text-center text-[#6b7280]">
              No se encontraron resultados para los filtros seleccionados.
            </div>
          ) : Object.entries(groupedEntries).map(([date, entries], groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-[#374151]" style={{ fontWeight: 600 }}>
                  <Clock className="w-4 h-4" />
                  {formatDate(date)}
                </div>
                <div className="flex-1 h-px bg-[#e1e4e8]" />
              </div>

              {/* Entries */}
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-[#e1e4e8] p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.actionType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs ${getActionColor(entry.actionType)}`} style={{ fontWeight: 600 }}>
                                {getActionLabel(entry.actionType)}
                              </span>
                              <span className="text-sm text-[#6b7280]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {entry.timestamp}
                              </span>
                            </div>

                            {/* Action Description */}
                            <div className="text-[#1f2937] mb-1">
                              {entry.actionType === 'profile_change' ? (
                                <span>
                                  <span style={{ fontWeight: 600 }}>{entry.affectedUser.name}</span>
                                  {' · '}
                                  <span className="px-2 py-0.5 bg-[#f3f4f6] rounded text-sm" style={{ fontWeight: 500 }}>
                                    {entry.profileChange?.from}
                                  </span>
                                  {' → '}
                                  <span className="px-2 py-0.5 bg-[#eff6ff] text-[#4f46e5] rounded text-sm" style={{ fontWeight: 600 }}>
                                    {entry.profileChange?.to}
                                  </span>
                                </span>
                              ) : (
                                <span>
                                  <span style={{ fontWeight: 600 }}>{entry.affectedUser.name}</span>
                                  {' · '}
                                  <span style={{ fontWeight: 600 }}>{entry.permission}</span>
                                  {' en '}
                                  <span style={{ fontWeight: 500 }}>{entry.book}</span>
                                </span>
                              )}
                            </div>

                            {/* User Details */}
                            <div className="text-sm text-[#6b7280]">
                              RUN: {entry.affectedUser.run}
                            </div>
                          </div>

                          {/* Performed By */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm mb-0.5" style={{ fontWeight: 500, color: '#374151' }}>
                                {entry.performedBy.name}
                              </div>
                              <div className="text-xs text-[#6b7280]">
                                RUN: {entry.performedBy.run}
                              </div>
                              <div className="text-xs text-[#6b7280]">
                                {entry.performedBy.role}
                              </div>
                            </div>
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                              style={{ backgroundColor: entry.performedBy.avatarColor, fontWeight: 600 }}
                            >
                              {entry.performedBy.avatar}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
