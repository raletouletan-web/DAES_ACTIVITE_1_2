import { useState, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { AdminConfig } from '../hooks/useAdminConfig';
import {
  Save,
  X,
  Video,
  FileText,
  Link2,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
  Type,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';

interface Props {
  config: AdminConfig;
  onSave: (updates: Partial<AdminConfig>) => void;
  onClose: () => void;
  onReset: () => void;
}

// Editor modules and formats configuration
const modules = {
  toolbar: [
    [{ font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const AdminPanel: React.FC<Props> = ({ config, onSave, onClose, onReset }) => {
  const [videoUrl, setVideoUrl] = useState(config.videoUrl);
  const [thumbnailUrl, setThumbnailUrl] = useState(config.thumbnailUrl);
  const [docUrl, setDocUrl] = useState(config.docUrl);
  const [docLabel, setDocLabel] = useState(config.docLabel);
  const [appTitle, setAppTitle] = useState(config.appTitle);
  const [appSubtitle, setAppSubtitle] = useState(config.appSubtitle);
  const [q1, setQ1] = useState(config.question1);
  const [q1Label, setQ1Label] = useState(config.question1Label || 'Question 1 - Activité 1');
  const [q2, setQ2] = useState(config.question2);
  const [q2Label, setQ2Label] = useState(config.question2Label || 'Question 2 - Activité 2');
  const [q3, setQ3] = useState(config.question3);
  const [q3Label, setQ3Label] = useState(config.question3Label || 'Question 3 - Activité 2');
  const [saved, setSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('appearance');

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?/]+)/);
    return match ? match[1] : null;
  };

  const handleSave = useCallback(() => {
    const updates: Partial<AdminConfig> = {
      videoUrl,
      thumbnailUrl,
      docUrl,
      docLabel,
      appTitle,
      appSubtitle,
      question1: q1,
      question1Label: q1Label,
      question2: q2,
      question2Label: q2Label,
      question3: q3,
      question3Label: q3Label,
    };
    onSave(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [videoUrl, thumbnailUrl, docUrl, docLabel, appTitle, appSubtitle, q1, q1Label, q2, q2Label, q3, q3Label, onSave]);

  const handleReset = () => {
    if (confirm('Réinitialiser tous les paramètres par défaut ? Cette action est irréversible.')) {
      onReset();
      // On re-sync with provided config (which might be default if hook reloaded)
      // but simpler to just force reload
      window.location.reload();
    }
  };

  const youtubeId = extractYouTubeId(videoUrl);

  const SectionHeader = ({
    icon: Icon,
    title,
    section,
    expanded,
  }: {
    icon: any;
    title: string;
    section: string;
    expanded: boolean;
  }) => (
    <button
      type="button"
      onClick={() => setExpandedSection(expanded ? '' : section)}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
        expanded
          ? 'border-sky-200 bg-sky-50/50'
          : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            expanded ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          <Icon size={17} />
        </div>
        <span className="text-sm font-bold text-gray-800">{title}</span>
      </div>
      {expanded ? (
        <ChevronUp size={18} className="text-gray-400" />
      ) : (
        <ChevronDown size={18} className="text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-16 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
              <Settings size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Panneau d'administration</h3>
              <p className="text-xs text-slate-400">Gérez l'apparence, la vidéo et les questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Appearance Section */}
          <SectionHeader icon={Type} title="Apparence — Titre" section="appearance" expanded={expandedSection === 'appearance'} />
          {expandedSection === 'appearance' && (
            <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-xl p-4 space-y-4 animate-fade-in">
              {/* App Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Globe size={13} /> Titre de l'application
                </label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="QUESTIONS ACTIVITÉ 1"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 bg-white focus:border-indigo-400 transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>

              {/* App Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Type size={13} /> Sous-titre
                </label>
                <input
                  type="text"
                  value={appSubtitle}
                  onChange={(e) => setAppSubtitle(e.target.value)}
                  placeholder="Aide Soignant"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 bg-white focus:border-indigo-400 transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Live Preview */}
              <div className="bg-white rounded-lg border border-indigo-200 p-3">
                <p className="text-xs text-indigo-400 font-medium mb-2 uppercase tracking-wider">Aperçu en temps réel</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{appTitle || 'Titre'}</p>
                    <p className="text-xs text-sky-500 font-semibold uppercase tracking-wider">{appSubtitle || 'Sous-titre'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Section */}
          <SectionHeader icon={Video} title="Vidéo YouTube" section="video" expanded={expandedSection === 'video'} />
          {expandedSection === 'video' && (
            <div className="bg-sky-50/50 border-2 border-sky-100 rounded-xl p-4 space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Link2 size={13} /> URL de la vidéo YouTube
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 bg-white focus:border-sky-400 transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400 font-mono"
                />
                {youtubeId && (
                  <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                    <Check size={12} /> ID détecté : {youtubeId}
                  </p>
                )}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon size={13} /> URL de la miniature (thumbnail)
                </label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://exemple.com/miniature.jpg ou laisser vide pour Patrice.jpg"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 bg-white focus:border-sky-400 transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si vide, utilise <code className="bg-gray-200 px-1 rounded text-xs">Patrice.jpg</code> par défaut.
                  Si l'URL YouTube contient un ID, la miniature YouTube est utilisée automatiquement.
                </p>
              </div>

              {youtubeId && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=0`}
                    title="Aperçu vidéo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formats acceptés : <code className="bg-gray-200 px-1 rounded text-xs">youtube.com/watch?v=ID</code>,{' '}
                <code className="bg-gray-200 px-1 rounded text-xs">youtu.be/ID</code>,{' '}
                <code className="bg-gray-200 px-1 rounded text-xs">youtube.com/embed/ID</code>
              </p>
            </div>
          )}

          {/* Question 1 */}
          <SectionHeader icon={FileText} title="Question 1" section="q1" expanded={expandedSection === 'q1'} />
          {expandedSection === 'q1' && (
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Type size={13} /> Intitulé de la question
                </label>
                <input
                  type="text"
                  value={q1Label}
                  onChange={(e) => setQ1Label(e.target.value)}
                  placeholder="Question 1 - Activité 1"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white focus:border-sky-400 transition-all duration-200 outline-none text-sm text-gray-800"
                />
              </div>
              <div className="admin-editor">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} /> Texte de la question
                </label>
                <ReactQuill
                  theme="snow"
                  value={q1}
                  onChange={setQ1}
                  modules={modules}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200"
                />
              </div>
              <p className="text-xs text-gray-400">Utilisez les sauts de ligne pour structurer le texte.</p>
            </div>
          )}

          {/* Question 2 */}
          <SectionHeader icon={FileText} title="Question 2" section="q2" expanded={expandedSection === 'q2'} />
          {expandedSection === 'q2' && (
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Type size={13} /> Intitulé de la question
                </label>
                <input
                  type="text"
                  value={q2Label}
                  onChange={(e) => setQ2Label(e.target.value)}
                  placeholder="Question 2 - Activité 2"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white focus:border-sky-400 transition-all duration-200 outline-none text-sm text-gray-800"
                />
              </div>
              <div className="admin-editor">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} /> Texte de la question
                </label>
                <ReactQuill
                  theme="snow"
                  value={q2}
                  onChange={setQ2}
                  modules={modules}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Question 3 */}
          <SectionHeader icon={FileText} title="Question 3" section="q3" expanded={expandedSection === 'q3'} />
          {expandedSection === 'q3' && (
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Type size={13} /> Intitulé de la question
                </label>
                <input
                  type="text"
                  value={q3Label}
                  onChange={(e) => setQ3Label(e.target.value)}
                  placeholder="Question 3 - Activité 2"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white focus:border-sky-400 transition-all duration-200 outline-none text-sm text-gray-800"
                />
              </div>
              <div className="admin-editor">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} /> Texte de la question
                </label>
                <ReactQuill
                  theme="snow"
                  value={q3}
                  onChange={setQ3}
                  modules={modules}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Companion Document Section */}
          <SectionHeader icon={FileText} title="Document d'accompagnement" section="doc" expanded={expandedSection === 'doc'} />
          {expandedSection === 'doc' && (
            <div className="bg-amber-50/50 border-2 border-amber-100 rounded-xl p-4 space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Link2 size={13} /> URL du document (Google Docs, etc.)
                </label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 bg-white focus:border-amber-400 transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Type size={13} /> Intitulé du lien
                </label>
                <input
                  type="text"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder="Ouvrir le document..."
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 bg-white focus:border-amber-400 transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Reset */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer mx-auto"
            >
              <RefreshCw size={13} />
              Réinitialiser les paramètres par défaut
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors cursor-pointer"
          >
            <X size={15} />
            Fermer
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1 animate-fade-in">
                <Check size={13} /> Sauvegardé !
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-sky-200 transition-all duration-200 cursor-pointer text-sm"
            >
              <Save size={15} />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
