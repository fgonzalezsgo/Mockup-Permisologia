import { useState } from 'react';
import { Lock, LockOpen, RotateCcw, Eye, Edit3, FileText, CheckCircle2, AlertCircle, History, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookPermissions {
  id: string;
  bookName: string;
  read: boolean;
  draft: boolean;
  write: boolean;
  acknowledge: boolean;
  status: 'locked' | 'inherited' | 'custom';
  lockReason?: string;
}

interface CustomizationModal {
  bookId: string;
  open: boolean;
}

export function PermissionMatrix() {
  const [activeTab, setActiveTab] = useState<'permissions' | 'history'>('permissions');
  const [selectedProfile, setSelectedProfile] = useState('consultor-titular');
  const [customizationModal, setCustomizationModal] = useState<CustomizationModal>({ bookId: '', open: false });
  const [customizationReason, setCustomizationReason] = useState('');

  const [permissions, setPermissions] = useState<BookPermissions[]>([
    {
      id: '1',
      bookName: 'Libro de Obra Maestro',
      read: true,
      draft: false,
      write: false,
      acknowledge: true,
      status: 'locked',
      lockReason: 'Regla Estricta - No modificable'
    },
    {
      id: '2',
      bookName: 'Libro de Comunicaciones Unidireccional',
      read: true,
      draft: false,
      write: false,
      acknowledge: true,
      status: 'inherited'
    },
    {
      id: '3',
      bookName: 'Libro de Especialidades (Calidad, Topografía)',
      read: true,
      draft: true,
      write: true,
      acknowledge: true,
      status: 'custom'
    }
  ]);

  const profiles = [
    { value: 'consultor-titular', label: 'Consultor Titular' },
    { value: 'ingeniero-residente', label: 'Ingeniero Residente' },
    { value: 'inspector-tecnico', label: 'Inspector Técnico' },
    { value: 'solo-lectura', label: 'Solo Lectura' },
  ];

  const handleCustomize = (bookId: string) => {
    setCustomizationModal({ bookId, open: true });
  };

  const confirmCustomization = () => {
    setPermissions(prev => prev.map(book =>
      book.id === customizationModal.bookId
        ? { ...book, status: 'custom' as const }
        : book
    ));
    setCustomizationModal({ bookId: '', open: false });
    setCustomizationReason('');
  };

  const handleReset = (bookId: string) => {
    setPermissions(prev => prev.map(book =>
      book.id === bookId
        ? { ...book, status: 'inherited' as const, read: true, draft: false, write: false, acknowledge: true }
        : book
    ));
  };

  const togglePermission = (bookId: string, permission: 'read' | 'draft' | 'write' | 'acknowledge') => {
    const book = permissions.find(b => b.id === bookId);
    if (book?.status === 'locked') return;

    if (book?.status === 'inherited') {
      handleCustomize(bookId);
      return;
    }

    setPermissions(prev => prev.map(book =>
      book.id === bookId
        ? { ...book, [permission]: !book[permission] }
        : book
    ));
  };

  return (
    <div className="bg-[#f8f9fb]">
      {/* Header */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-xl" style={{ fontWeight: 600 }}>
              JP
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl" style={{ fontWeight: 600, color: '#1f2937' }}>
                  Juan Pérez
                </h1>
                <span className="text-[#6b7280]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
                  12.345.678-9
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eff6ff] text-[#1e40af] rounded-full text-sm" style={{ fontWeight: 500 }}>
                <User className="w-3.5 h-3.5" />
                Grupo: Mandante
              </div>
            </div>

            {/* Profile Selector */}
            <div className="w-80">
              <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                Perfil de Acceso (Plantilla)
              </label>
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
                style={{ fontWeight: 500 }}
              >
                {profiles.map(profile => (
                  <option key={profile.value} value={profile.value}>
                    {profile.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#6b7280] mt-1.5">
                El perfil define los permisos base en todos los libros. Puede personalizar libros específicos en la matriz inferior.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#e1e4e8]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('permissions')}
              className={`
                relative px-1 py-4 transition-colors
                ${activeTab === 'permissions' ? 'text-[#4f46e5]' : 'text-[#6b7280] hover:text-[#1f2937]'}
              `}
              style={{ fontWeight: 500 }}
            >
              Matriz de Accesos
              {activeTab === 'permissions' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`
                relative px-1 py-4 transition-colors flex items-center gap-2
                ${activeTab === 'history' ? 'text-[#4f46e5]' : 'text-[#6b7280] hover:text-[#1f2937]'}
              `}
              style={{ fontWeight: 500 }}
            >
              <History className="w-4 h-4" />
              Historial de Cambios / Auditoría
              {activeTab === 'history' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5]"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'permissions' ? (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Table */}
              <div className="bg-white rounded-xl border border-[#e1e4e8] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-4 bg-[#f8f9fb] border-b border-[#e1e4e8]">
                  <div className="text-sm" style={{ fontWeight: 600, color: '#374151' }}>
                    Familia de Libro / Nombre
                  </div>
                  <div className="text-sm flex items-center gap-2" style={{ fontWeight: 600, color: '#374151' }}>
                    <Eye className="w-4 h-4" />
                    Lectura
                  </div>
                  <div className="text-sm flex items-center gap-2" style={{ fontWeight: 600, color: '#374151' }}>
                    <Edit3 className="w-4 h-4" />
                    Asistente
                  </div>
                  <div className="text-sm flex items-center gap-2" style={{ fontWeight: 600, color: '#374151' }}>
                    <FileText className="w-4 h-4" />
                    Escritura
                  </div>
                  <div className="text-sm flex items-center gap-2" style={{ fontWeight: 600, color: '#374151' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    Toma Conoc.
                  </div>
                  <div className="text-sm text-right" style={{ fontWeight: 600, color: '#374151' }}>
                    Acciones / Estado
                  </div>
                </div>

                {/* Table Rows */}
                {permissions.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-5 border-b border-[#e1e4e8] last:border-b-0
                      ${book.status === 'locked' ? 'bg-[#f9fafb]' : 'bg-white'}
                      ${book.status === 'custom' ? 'border-l-4 border-l-[#f59e0b]' : ''}
                    `}
                  >
                    {/* Book Name */}
                    <div className="flex items-center gap-2">
                      {book.status === 'custom' && (
                        <AlertCircle className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
                      )}
                      <span style={{ fontWeight: 500, color: '#1f2937' }}>
                        {book.bookName}
                      </span>
                    </div>

                    {/* Read Permission */}
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={book.read}
                          onChange={() => togglePermission(book.id, 'read')}
                          disabled={book.status === 'locked'}
                          className="sr-only peer"
                        />
                        <div className={`
                          w-5 h-5 border-2 rounded transition-all
                          ${book.read
                            ? 'bg-[#4f46e5] border-[#4f46e5]'
                            : 'bg-white border-[#d1d5db]'
                          }
                          ${book.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#4f46e5]'}
                          flex items-center justify-center
                        `}>
                          {book.read && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Draft Permission */}
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={book.draft}
                          onChange={() => togglePermission(book.id, 'draft')}
                          disabled={book.status === 'locked'}
                          className="sr-only peer"
                        />
                        <div className={`
                          w-5 h-5 border-2 rounded transition-all
                          ${book.draft
                            ? 'bg-[#4f46e5] border-[#4f46e5]'
                            : 'bg-white border-[#d1d5db]'
                          }
                          ${book.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#4f46e5]'}
                          flex items-center justify-center
                        `}>
                          {book.draft && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Write Permission */}
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={book.write}
                          onChange={() => togglePermission(book.id, 'write')}
                          disabled={book.status === 'locked'}
                          className="sr-only peer"
                        />
                        <div className={`
                          w-5 h-5 border-2 rounded transition-all
                          ${book.write
                            ? book.status === 'custom'
                              ? 'bg-[#4f46e5] border-[#4f46e5] ring-2 ring-[#4f46e5] ring-offset-2'
                              : 'bg-[#4f46e5] border-[#4f46e5]'
                            : 'bg-white border-[#d1d5db]'
                          }
                          ${book.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#4f46e5]'}
                          flex items-center justify-center
                        `}>
                          {book.write && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Acknowledge Permission */}
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={book.acknowledge}
                          onChange={() => togglePermission(book.id, 'acknowledge')}
                          disabled={book.status === 'locked'}
                          className="sr-only peer"
                        />
                        <div className={`
                          w-5 h-5 border-2 rounded transition-all
                          ${book.acknowledge
                            ? 'bg-[#4f46e5] border-[#4f46e5]'
                            : 'bg-white border-[#d1d5db]'
                          }
                          ${book.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#4f46e5]'}
                          flex items-center justify-center
                        `}>
                          {book.acknowledge && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      {book.status === 'locked' && (
                        <div className="flex items-center gap-2 text-[#6b7280] text-sm">
                          <Lock className="w-4 h-4" />
                          <span>{book.lockReason}</span>
                        </div>
                      )}
                      {book.status === 'inherited' && (
                        <button
                          onClick={() => handleCustomize(book.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#4f46e5] hover:bg-[#eef2ff] rounded-lg transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <LockOpen className="w-4 h-4" />
                          Personalizar
                        </button>
                      )}
                      {book.status === 'custom' && (
                        <button
                          onClick={() => handleReset(book.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <RotateCcw className="w-4 h-4" />
                          Resetear a Perfil
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-4 mt-8">
                <button className="px-6 py-2.5 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors" style={{ fontWeight: 500 }}>
                  Descartar Cambios
                </button>
                <button className="px-6 py-2.5 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors" style={{ fontWeight: 600 }}>
                  Guardar Configuraci�n
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl border border-[#e1e4e8] p-8"
            >
              <div className="text-center py-12">
                <History className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" />
                <h3 className="text-lg mb-2" style={{ fontWeight: 600, color: '#1f2937' }}>
                  Historial de Auditoría
                </h3>
                <p className="text-[#6b7280]">
                  Aquí se mostrarán todos los cambios realizados a los permisos de este usuario.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Customization Modal */}
      <AnimatePresence>
        {customizationModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 z-50"
            onClick={() => setCustomizationModal({ bookId: '', open: false })}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#fef3c7] flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div>
                  <h3 className="text-xl mb-1" style={{ fontWeight: 600, color: '#1f2937' }}>
                    Confirmar Personalización
                  </h3>
                  <p className="text-sm text-[#6b7280]">
                    Este cambio romperá la herencia del perfil para este libro.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#374151' }}>
                  Motivo de la excepción:
                </label>
                <textarea
                  value={customizationReason}
                  onChange={(e) => setCustomizationReason(e.target.value)}
                  placeholder="Describe por qué este usuario necesita permisos personalizados..."
                  className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCustomizationModal({ bookId: '', open: false })}
                  className="flex-1 px-4 py-2.5 text-[#374151] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCustomization}
                  className="flex-1 px-4 py-2.5 bg-[#4f46e5] text-white hover:bg-[#4338ca] rounded-lg transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Confirmar cambio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
