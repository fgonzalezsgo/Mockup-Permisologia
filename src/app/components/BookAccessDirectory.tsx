import { useState } from 'react';
import { Search, ChevronRight, ChevronDown, BookOpen, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  group: string;
  permissions: {
    read: boolean;
    draft: boolean;
    write: boolean;
    acknowledge: boolean;
  };
  hasException?: boolean;
}

interface Book {
  id: string;
  name: string;
  category: 'Contractual' | 'Operativo' | 'Técnico';
  userCount: number;
  users: User[];
}

const mockBooks: Book[] = [
  {
    id: '1',
    name: 'Libro de Obra Maestro',
    category: 'Contractual',
    userCount: 4,
    users: []
  },
  {
    id: '2',
    name: 'Libro de Comunicaciones',
    category: 'Operativo',
    userCount: 3,
    users: [
      {
        id: '1',
        name: 'Juan Pérez',
        avatar: 'JP',
        role: 'Administrador Mandante',
        group: 'Mandante',
        permissions: { read: true, draft: true, write: true, acknowledge: true },
        hasException: false
      },
      {
        id: '2',
        name: 'María González',
        avatar: 'MG',
        role: 'Consultor Titular',
        group: 'Mandante',
        permissions: { read: true, draft: true, write: true, acknowledge: false },
        hasException: true
      },
      {
        id: '3',
        name: 'Carlos Soto',
        avatar: 'CS',
        role: 'Visualizador',
        group: 'Contratista',
        permissions: { read: true, draft: false, write: false, acknowledge: false },
        hasException: false
      }
    ]
  },
  {
    id: '3',
    name: 'Libro de Especialidades',
    category: 'Técnico',
    userCount: 2,
    users: []
  }
];

export function BookAccessDirectory() {
  const [expandedBooks, setExpandedBooks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [permissionFilter, setPermissionFilter] = useState('all');

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const getPermissionBadges = (permissions: User['permissions'], hasException: boolean) => {
    const badges = [];
    if (permissions.read) badges.push({ label: 'Lectura', type: 'normal' });
    if (permissions.draft) badges.push({ label: 'Asistente', type: 'normal' });
    if (permissions.write) badges.push({ label: 'Escritura', type: hasException ? 'exception' : 'normal' });
    if (permissions.acknowledge) badges.push({ label: 'Toma Conoc.', type: 'normal' });
    return badges;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Contractual':
        return 'bg-[#dbeafe] text-[#1e40af]';
      case 'Operativo':
        return 'bg-[#e0e7ff] text-[#4338ca]';
      case 'Técnico':
        return 'bg-[#fef3c7] text-[#92400e]';
      default:
        return 'bg-[#f3f4f6] text-[#374151]';
    }
  };

  return (
    <div className="bg-[#f8f9fb]">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className="text-3xl mb-6" style={{ fontWeight: 600, color: '#1f2937' }}>
            Auditoría de Accesos por Libro
          </h1>

          {/* Toolbar */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar libro o usuario..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              style={{ fontWeight: 500 }}
            >
              <option value="all">Familia ▾</option>
              <option value="contractual">Contractual</option>
              <option value="operativo">Operativo</option>
              <option value="tecnico">Técnico</option>
            </select>

            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              style={{ fontWeight: 500 }}
            >
              <option value="all">Grupo ▾</option>
              <option value="mandante">Mandante</option>
              <option value="contratista">Contratista</option>
              <option value="subcontratista">Subcontratista</option>
            </select>

            <select
              value={permissionFilter}
              onChange={(e) => setPermissionFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              style={{ fontWeight: 500 }}
            >
              <option value="all">Tipo de Permiso ▾</option>
              <option value="read">Lectura</option>
              <option value="write">Escritura</option>
              <option value="draft">Asistente</option>
              <option value="acknowledge">Toma Conocimiento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-3">
          {mockBooks.map((book, index) => {
            const isExpanded = expandedBooks.includes(book.id);

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg border border-[#e1e4e8] overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleBook(book.id)}
                  className="w-full px-6 py-5 flex items-center gap-4 hover:bg-[#f9fafb] transition-colors"
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f3f4f6]">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#374151]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#374151]" />
                    )}
                  </div>

                  {/* Book Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#eef2ff]">
                    <BookOpen className="w-5 h-5 text-[#4f46e5]" />
                  </div>

                  {/* Title */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                      {book.name}
                    </h3>
                  </div>

                  {/* Category Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(book.category)}`} style={{ fontWeight: 500 }}>
                    {book.category}
                  </div>

                  {/* User Count */}
                  <div className="flex items-center gap-2 text-[#6b7280] text-sm">
                    <Users className="w-4 h-4" />
                    <span style={{ fontWeight: 500 }}>
                      {book.userCount} Usuarios con acceso
                    </span>
                  </div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#f9fafb] border-t border-[#e1e4e8]">
                        {book.users.length > 0 ? (
                          <div className="p-6">
                            {/* Table */}
                            <div className="bg-white rounded-lg border border-[#e1e4e8] overflow-hidden">
                              {/* Table Header */}
                              <div className="grid grid-cols-[2fr_2fr_1.5fr_3fr_auto] gap-6 px-6 py-4 bg-[#f8f9fb] border-b border-[#e1e4e8]">
                                <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Usuario
                                </div>
                                <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Rol en Contrato
                                </div>
                                <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Grupo
                                </div>
                                <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Permisos Efectivos
                                </div>
                                <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                                  Estado
                                </div>
                              </div>

                              {/* Table Rows */}
                              {book.users.map((user, userIndex) => (
                                <motion.div
                                  key={user.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: userIndex * 0.05 }}
                                  className={`
                                    grid grid-cols-[2fr_2fr_1.5fr_3fr_auto] gap-6 px-6 py-5 border-b border-[#e1e4e8] last:border-b-0
                                    ${user.hasException ? 'bg-[#fffbeb]' : 'bg-white'}
                                  `}
                                >
                                  {/* User */}
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-sm" style={{ fontWeight: 600 }}>
                                      {user.avatar}
                                    </div>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>
                                      {user.name}
                                    </span>
                                  </div>

                                  {/* Role */}
                                  <div className="flex items-center text-[#374151]">
                                    {user.role}
                                  </div>

                                  {/* Group */}
                                  <div className="flex items-center text-[#6b7280]">
                                    {user.group}
                                  </div>

                                  {/* Permissions */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {getPermissionBadges(user.permissions, user.hasException || false).map((badge, badgeIndex) => (
                                      <span
                                        key={badgeIndex}
                                        className={`
                                          px-2.5 py-1 rounded-full text-xs
                                          ${badge.type === 'exception'
                                            ? 'bg-white border-2 border-[#f59e0b] text-[#f59e0b]'
                                            : 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]'
                                          }
                                        `}
                                        style={{ fontWeight: 500 }}
                                      >
                                        {badge.label}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Status */}
                                  <div className="flex items-center justify-end">
                                    {user.hasException && (
                                      <div className="flex items-center gap-2 text-[#f59e0b] text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span style={{ fontWeight: 500 }}>Excepción manual</span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-[#6b7280]">
                            No hay usuarios con acceso a este libro
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-lg border border-[#e1e4e8] p-6">
            <div className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
              {mockBooks.length}
            </div>
            <div className="text-sm text-[#6b7280]">
              Libros totales
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e1e4e8] p-6">
            <div className="text-2xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
              {mockBooks.reduce((sum, book) => sum + book.userCount, 0)}
            </div>
            <div className="text-sm text-[#6b7280]">
              Accesos totales
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e1e4e8] p-6">
            <div className="flex items-center gap-2 text-2xl mb-1" style={{ fontWeight: 600, color: '#f59e0b' }}>
              <AlertCircle className="w-6 h-6" />
              1
            </div>
            <div className="text-sm text-[#6b7280]">
              Excepciones manuales
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

