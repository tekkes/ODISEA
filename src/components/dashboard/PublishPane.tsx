import React, { useState, useEffect } from 'react';
import {
  useOdiseaStore,
  WordPressAccount,
  GhostAccount,
  MediumAccount,
  MicroBlogAccount,
  PublishResult,
} from '../../store/useOdiseaStore';
import {
  Send,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Settings2,
  Calendar,
  Tag,
  Folder,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

type PlatformTab = 'wordpress' | 'ghost' | 'medium' | 'microblog' | 'substack';

export const PublishPane: React.FC = () => {
  const {
    activeSheet,
    publishAccounts,
    savePublishAccounts,
    publishToWordPress,
    publishToGhost,
    publishToMedium,
    publishToMicroBlog,
    copyForSubstack,
  } = useOdiseaStore();

  const [activePlatform, setActivePlatform] = useState<PlatformTab>('wordpress');
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  // Form states
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const [postStatus, setPostStatus] = useState<'draft' | 'publish' | 'future'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [categoriesStr, setCategoriesStr] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [slug, setSlug] = useState('');

  // Execution states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    url?: string;
  } | null>(null);

  // Substack copy feedback
  const [copiedSubstack, setCopiedSubstack] = useState(false);

  // Parse existing sheet publish status
  const currentPublishStatus = React.useMemo<PublishResult | null>(() => {
    if (!activeSheet?.publish_status_json) return null;
    try {
      return JSON.parse(activeSheet.publish_status_json);
    } catch {
      return null;
    }
  }, [activeSheet?.publish_status_json]);

  // Determine if active platform matches existing published post
  const isExistingPostOnActivePlatform = React.useMemo(() => {
    if (!currentPublishStatus) return false;
    return (
      (activePlatform === 'wordpress' && currentPublishStatus.platform === 'wordpress') ||
      (activePlatform === 'ghost' && currentPublishStatus.platform === 'ghost') ||
      (activePlatform === 'medium' && currentPublishStatus.platform === 'medium') ||
      (activePlatform === 'microblog' && currentPublishStatus.platform === 'microblog')
    );
  }, [currentPublishStatus, activePlatform]);

  useEffect(() => {
    setPublishFeedback(null);
  }, [activePlatform, activeSheet?.id]);

  const handlePublish = async () => {
    if (!activeSheet) return;
    setIsPublishing(true);
    setPublishFeedback(null);

    const categories = categoriesStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      let result: PublishResult;

      if (activePlatform === 'wordpress') {
        const wpStatus = postStatus === 'draft' ? 'draft' : postStatus === 'future' ? 'future' : 'publish';
        result = await publishToWordPress({
          sheetId: activeSheet.id,
          accountIndex: selectedAccountIndex,
          status: wpStatus,
          scheduledDate: postStatus === 'future' && scheduledDate ? scheduledDate : undefined,
          categories,
          tags,
          featuredImageUrl: featuredImageUrl.trim() || undefined,
        });
      } else if (activePlatform === 'ghost') {
        const ghostStatus = postStatus === 'draft' ? 'draft' : postStatus === 'future' ? 'scheduled' : 'published';
        result = await publishToGhost({
          sheetId: activeSheet.id,
          accountIndex: selectedAccountIndex,
          status: ghostStatus,
          scheduledDate: postStatus === 'future' && scheduledDate ? scheduledDate : undefined,
          tags,
          featureImageUrl: featuredImageUrl.trim() || undefined,
        });
      } else if (activePlatform === 'medium') {
        const medStatus = postStatus === 'draft' ? 'draft' : 'public';
        result = await publishToMedium({
          sheetId: activeSheet.id,
          accountIndex: selectedAccountIndex,
          publishStatus: medStatus,
          tags,
        });
      } else if (activePlatform === 'microblog') {
        result = await publishToMicroBlog({
          sheetId: activeSheet.id,
          accountIndex: selectedAccountIndex,
          categories,
          slug: slug.trim() || undefined,
        });
      } else {
        return;
      }

      setPublishFeedback({
        type: 'success',
        message: isExistingPostOnActivePlatform
          ? `Entrada actualizada exitosamente en ${result.platform}.`
          : `Nueva entrada publicada exitosamente en ${result.platform}.`,
        url: result.url,
      });
    } catch (err: any) {
      setPublishFeedback({
        type: 'error',
        message: String(err?.message || err || 'Error desconocido al publicar'),
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyForSubstack = async () => {
    if (!activeSheet) return;
    try {
      const res = await copyForSubstack(activeSheet.id);
      setCopiedSubstack(true);
      setTimeout(() => setCopiedSubstack(false), 3000);
      setPublishFeedback({
        type: 'success',
        message: `¡Copiado! ${res.word_count} palabras formateadas listas para pegar en el editor de Substack.`,
      });
    } catch (err: any) {
      setPublishFeedback({
        type: 'error',
        message: `Error al formatear para Substack: ${err}`,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-primary)]">
      {/* Top Banner / Sheet Status Indicator */}
      <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-xs tracking-wide flex items-center gap-1.5">
            <Send size={13} className="text-[var(--color-accent)] micro-icon rotate-45" />
            Estado de Publicación
          </span>
          <button
            onClick={() => setShowAccountSettings(!showAccountSettings)}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] flex items-center gap-1 transition-colors"
            title="Configuración de cuentas"
          >
            <Settings2 size={13} className="micro-icon" />
            <span className="text-[10px]">Cuentas</span>
          </button>
        </div>

        {currentPublishStatus ? (
          <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="micro-pill bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 size={10} className="micro-icon" />
                {currentPublishStatus.platform.toUpperCase()}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                ID: {currentPublishStatus.post_id.slice(0, 16)}
              </span>
            </div>
            {currentPublishStatus.url && (
              <a
                href={currentPublishStatus.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[var(--color-accent)] hover:underline flex items-center gap-1 truncate font-medium mt-0.5"
              >
                <span className="truncate">{currentPublishStatus.url}</span>
                <ExternalLink size={11} className="micro-icon shrink-0" />
              </a>
            )}
            <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
              Estado: <span className="capitalize text-[var(--color-text-primary)]">{currentPublishStatus.status}</span>
              {currentPublishStatus.published_at && (
                <span> · {new Date(currentPublishStatus.published_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-md bg-[var(--color-bg-hover)]/60 text-[var(--color-text-muted)] text-[11px] flex items-center gap-1.5">
            <Globe size={13} className="micro-icon shrink-0 opacity-60" />
            <span>Esta hoja aún no ha sido publicada.</span>
          </div>
        )}
      </div>

      {/* Account Settings Drawer / Editor */}
      {showAccountSettings ? (
        <AccountConfigSection
          config={publishAccounts}
          onSave={savePublishAccounts}
          onClose={() => setShowAccountSettings(false)}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Platform Tabs */}
          <div className="grid grid-cols-5 gap-1 p-0.5 bg-[var(--color-bg-hover)] rounded-md select-none">
            {(['wordpress', 'ghost', 'medium', 'microblog', 'substack'] as PlatformTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePlatform(tab)}
                className={`py-1 text-[11px] font-medium rounded transition-all truncate text-center ${
                  activePlatform === tab
                    ? 'bg-[var(--color-bg-primary)] text-[var(--color-accent)] shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {tab === 'wordpress' && 'WordPress'}
                {tab === 'ghost' && 'Ghost'}
                {tab === 'medium' && 'Medium'}
                {tab === 'microblog' && 'Micro.blog'}
                {tab === 'substack' && 'Substack'}
              </button>
            ))}
          </div>

          {/* Substack Dedicated Mode */}
          {activePlatform === 'substack' ? (
            <div className="space-y-3 pt-1">
              <div className="p-2.5 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#FF6719]/15 text-[#FF6719] flex items-center justify-center font-bold text-xs">
                    S
                  </span>
                  <div>
                    <h5 className="font-semibold text-xs">Copy for Substack</h5>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Formato de portapapeles enriquecido compatible con Substack.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  Transforma la hoja Markdown XL actual eliminando comentarios internos (<code className="micro-badge">%%...%%</code>),
                  resolviendo encabezados semánticos, citas, notas al pie e imágenes en HTML listo para pegar directamente (<kbd className="font-mono text-[10px]">Ctrl+V</kbd>) en el editor de Substack.
                </p>
                <button
                  onClick={handleCopyForSubstack}
                  disabled={!activeSheet}
                  className="w-full py-2 px-3 rounded bg-[var(--color-accent)] text-white hover:brightness-110 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  {copiedSubstack ? (
                    <>
                      <Check size={13} className="micro-icon" />
                      <span>¡Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="micro-icon" />
                      <span>Copiar para Substack</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Standard Publisher Connectors (WordPress, Ghost, Medium, Micro.blog) */
            <div className="space-y-3 pt-1">
              {/* Account Selector */}
              <div>
                <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1">
                  Cuenta Conectada
                </label>
                {getAccountsForPlatform(activePlatform, publishAccounts).length > 0 ? (
                  <select
                    value={selectedAccountIndex}
                    onChange={(e) => setSelectedAccountIndex(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-accent)]"
                  >
                    {getAccountsForPlatform(activePlatform, publishAccounts).map((acc, idx) => (
                      <option key={idx} value={idx}>
                        {acc.name} ({acc.endpoint || 'API Token'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] flex items-center justify-between">
                    <span>No hay cuenta de {activePlatform} configurada.</span>
                    <button
                      onClick={() => setShowAccountSettings(true)}
                      className="underline font-semibold ml-2 hover:opacity-80"
                    >
                      Añadir
                    </button>
                  </div>
                )}
              </div>

              {/* Publication Status Selector */}
              <div>
                <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1">
                  Estado de Publicación
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['draft', 'publish', 'future'] as const).map((st) => {
                    const label = st === 'draft' ? 'Borrador' : st === 'publish' ? 'Publicado' : 'Programado';
                    const isSelected = postStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPostStatus(st)}
                        className={`py-1 px-2 rounded text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                            : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date/Time Picker for Scheduled Posts */}
              {postStatus === 'future' && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                    <Calendar size={12} className="micro-icon" />
                    Fecha y Hora Programada (UTC / Local)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-accent)]"
                  />
                </div>
              )}

              {/* Categories */}
              {(activePlatform === 'wordpress' || activePlatform === 'microblog') && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                    <Folder size={12} className="micro-icon" />
                    Categorías (separadas por comas)
                  </label>
                  <input
                    type="text"
                    placeholder="Ensayos, Novela, Personal"
                    value={categoriesStr}
                    onChange={(e) => setCategoriesStr(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-accent)]"
                  />
                </div>
              )}

              {/* Tags */}
              {(activePlatform === 'wordpress' || activePlatform === 'ghost' || activePlatform === 'medium') && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                    <Tag size={12} className="micro-icon" />
                    Etiquetas / Tags (separadas por comas)
                  </label>
                  <input
                    type="text"
                    placeholder="literatura, ulises, windows"
                    value={tagsStr}
                    onChange={(e) => setTagsStr(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-accent)]"
                  />
                </div>
              )}

              {/* Featured Image URL */}
              {(activePlatform === 'wordpress' || activePlatform === 'ghost') && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                    <ImageIcon size={12} className="micro-icon" />
                    Imagen Destacada (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/portada.jpg"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-accent)]"
                  />
                </div>
              )}

              {/* Micro.blog Slug */}
              {activePlatform === 'microblog' && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1">
                    Slug personalizado (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="mi-articulo-personal"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-hidden focus:border-[var(--color-accent)]"
                  />
                </div>
              )}

              {/* Action Button: Publish or Update */}
              <div className="pt-2">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !activeSheet}
                  className={`w-full py-2 px-3 rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs text-white ${
                    isExistingPostOnActivePlatform
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-[var(--color-accent)] hover:brightness-110'
                  } disabled:opacity-50`}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw size={13} className="micro-icon animate-spin" />
                      <span>Conectando con {activePlatform}...</span>
                    </>
                  ) : isExistingPostOnActivePlatform ? (
                    <>
                      <RefreshCw size={13} className="micro-icon" />
                      <span>Actualizar Entrada en {formatPlatformName(activePlatform)}</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} className="micro-icon rotate-45" />
                      <span>Publicar en {formatPlatformName(activePlatform)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Feedback alert */}
          {publishFeedback && (
            <div
              className={`p-2.5 rounded-md text-[11px] border flex flex-col gap-1 ${
                publishFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {publishFeedback.type === 'success' ? (
                  <CheckCircle2 size={13} className="micro-icon shrink-0" />
                ) : (
                  <AlertCircle size={13} className="micro-icon shrink-0" />
                )}
                <span>{publishFeedback.message}</span>
              </div>
              {publishFeedback.url && (
                <a
                  href={publishFeedback.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline flex items-center gap-1 ml-4 mt-0.5 font-medium truncate"
                >
                  <span className="truncate">{publishFeedback.url}</span>
                  <ExternalLink size={10} className="micro-icon shrink-0" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function formatPlatformName(platform: PlatformTab): string {
  switch (platform) {
    case 'wordpress':
      return 'WordPress';
    case 'ghost':
      return 'Ghost';
    case 'medium':
      return 'Medium';
    case 'microblog':
      return 'Micro.blog';
    case 'substack':
      return 'Substack';
  }
}

function getAccountsForPlatform(platform: PlatformTab, cfg: any): Array<{ name: string; endpoint?: string }> {
  if (!cfg) return [];
  switch (platform) {
    case 'wordpress':
      return cfg.wordpress || [];
    case 'ghost':
      return cfg.ghost || [];
    case 'medium':
      return cfg.medium || [];
    case 'microblog':
      return cfg.microblog || [];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Account Configuration Drawer
// ---------------------------------------------------------------------------

interface AccountConfigSectionProps {
  config: any;
  onSave: (newConfig: any) => Promise<void>;
  onClose: () => void;
}

const AccountConfigSection: React.FC<AccountConfigSectionProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    config || {
      wordpress: [],
      ghost: [],
      medium: [],
      microblog: [],
    }
  );

  const [activeAccountTab, setActiveAccountTab] = useState<'wp' | 'ghost' | 'med' | 'mb'>('wp');

  const handleAddWp = () => {
    setFormData((prev: any) => ({
      ...prev,
      wordpress: [
        ...(prev.wordpress || []),
        { name: 'Nueva Web WordPress', endpoint: 'https://', username: '', app_password: '' },
      ],
    }));
  };

  const handleAddGhost = () => {
    setFormData((prev: any) => ({
      ...prev,
      ghost: [
        ...(prev.ghost || []),
        { name: 'Publicación Ghost', endpoint: 'https://', admin_api_key: '' },
      ],
    }));
  };

  const handleAddMedium = () => {
    setFormData((prev: any) => ({
      ...prev,
      medium: [
        ...(prev.medium || []),
        { name: 'Perfil Medium', token: '' },
      ],
    }));
  };

  const handleAddMicroBlog = () => {
    setFormData((prev: any) => ({
      ...prev,
      microblog: [
        ...(prev.microblog || []),
        { name: 'Micro.blog', app_token: '' },
      ],
    }));
  };

  const handleSave = async () => {
    await onSave(formData);
    onClose();
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--color-bg-primary)]/30">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <h4 className="font-semibold text-xs">Cuentas de Publicación</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="px-2 py-0.5 rounded text-[11px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[var(--color-accent)] text-white hover:brightness-110"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[var(--color-border)] pb-1">
        <button
          onClick={() => setActiveAccountTab('wp')}
          className={`px-2 py-1 text-[11px] rounded ${activeAccountTab === 'wp' ? 'bg-[var(--color-accent)] text-white font-semibold' : 'text-[var(--color-text-muted)]'}`}
        >
          WordPress ({formData.wordpress?.length || 0})
        </button>
        <button
          onClick={() => setActiveAccountTab('ghost')}
          className={`px-2 py-1 text-[11px] rounded ${activeAccountTab === 'ghost' ? 'bg-[var(--color-accent)] text-white font-semibold' : 'text-[var(--color-text-muted)]'}`}
        >
          Ghost ({formData.ghost?.length || 0})
        </button>
        <button
          onClick={() => setActiveAccountTab('med')}
          className={`px-2 py-1 text-[11px] rounded ${activeAccountTab === 'med' ? 'bg-[var(--color-accent)] text-white font-semibold' : 'text-[var(--color-text-muted)]'}`}
        >
          Medium ({formData.medium?.length || 0})
        </button>
        <button
          onClick={() => setActiveAccountTab('mb')}
          className={`px-2 py-1 text-[11px] rounded ${activeAccountTab === 'mb' ? 'bg-[var(--color-accent)] text-white font-semibold' : 'text-[var(--color-text-muted)]'}`}
        >
          Micro.blog ({formData.microblog?.length || 0})
        </button>
      </div>

      {/* WordPress Editor */}
      {activeAccountTab === 'wp' && (
        <div className="space-y-2">
          {formData.wordpress?.map((acc: WordPressAccount, i: number) => (
            <div key={i} className="p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Nombre de la cuenta"
                  value={acc.name}
                  onChange={(e) => {
                    const next = [...formData.wordpress];
                    next[i].name = e.target.value;
                    setFormData({ ...formData, wordpress: next });
                  }}
                  className="font-semibold text-xs bg-transparent border-none focus:outline-hidden text-[var(--color-text-primary)]"
                />
                <button
                  onClick={() => {
                    const next = formData.wordpress.filter((_: any, idx: number) => idx !== i);
                    setFormData({ ...formData, wordpress: next });
                  }}
                  className="text-rose-500 hover:text-rose-600 p-0.5"
                >
                  <Trash2 size={12} className="micro-icon" />
                </button>
              </div>
              <input
                type="text"
                placeholder="URL del sitio (https://misitio.com)"
                value={acc.endpoint}
                onChange={(e) => {
                  const next = [...formData.wordpress];
                  next[i].endpoint = e.target.value;
                  setFormData({ ...formData, wordpress: next });
                }}
                className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Usuario WP"
                  value={acc.username}
                  onChange={(e) => {
                    const next = [...formData.wordpress];
                    next[i].username = e.target.value;
                    setFormData({ ...formData, wordpress: next });
                  }}
                  className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                />
                <input
                  type="password"
                  placeholder="Contraseña de Aplicación"
                  value={acc.app_password}
                  onChange={(e) => {
                    const next = [...formData.wordpress];
                    next[i].app_password = e.target.value;
                    setFormData({ ...formData, wordpress: next });
                  }}
                  className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                />
              </div>
            </div>
          ))}
          <button
            onClick={handleAddWp}
            className="w-full py-1.5 rounded border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-medium flex items-center justify-center gap-1"
          >
            <Plus size={12} className="micro-icon" />
            <span>Añadir Cuenta de WordPress</span>
          </button>
        </div>
      )}

      {/* Ghost Editor */}
      {activeAccountTab === 'ghost' && (
        <div className="space-y-2">
          {formData.ghost?.map((acc: GhostAccount, i: number) => (
            <div key={i} className="p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Nombre de la cuenta"
                  value={acc.name}
                  onChange={(e) => {
                    const next = [...formData.ghost];
                    next[i].name = e.target.value;
                    setFormData({ ...formData, ghost: next });
                  }}
                  className="font-semibold text-xs bg-transparent border-none focus:outline-hidden text-[var(--color-text-primary)]"
                />
                <button
                  onClick={() => {
                    const next = formData.ghost.filter((_: any, idx: number) => idx !== i);
                    setFormData({ ...formData, ghost: next });
                  }}
                  className="text-rose-500 hover:text-rose-600 p-0.5"
                >
                  <Trash2 size={12} className="micro-icon" />
                </button>
              </div>
              <input
                type="text"
                placeholder="URL de Ghost Admin (https://odisea.ghost.io)"
                value={acc.endpoint}
                onChange={(e) => {
                  const next = [...formData.ghost];
                  next[i].endpoint = e.target.value;
                  setFormData({ ...formData, ghost: next });
                }}
                className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
              <input
                type="password"
                placeholder="Admin API Key (id:secret_hex)"
                value={acc.admin_api_key}
                onChange={(e) => {
                  const next = [...formData.ghost];
                  next[i].admin_api_key = e.target.value;
                  setFormData({ ...formData, ghost: next });
                }}
                className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
            </div>
          ))}
          <button
            onClick={handleAddGhost}
            className="w-full py-1.5 rounded border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-medium flex items-center justify-center gap-1"
          >
            <Plus size={12} className="micro-icon" />
            <span>Añadir Publicación Ghost</span>
          </button>
        </div>
      )}

      {/* Medium Editor */}
      {activeAccountTab === 'med' && (
        <div className="space-y-2">
          {formData.medium?.map((acc: MediumAccount, i: number) => (
            <div key={i} className="p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Nombre de la cuenta"
                  value={acc.name}
                  onChange={(e) => {
                    const next = [...formData.medium];
                    next[i].name = e.target.value;
                    setFormData({ ...formData, medium: next });
                  }}
                  className="font-semibold text-xs bg-transparent border-none focus:outline-hidden text-[var(--color-text-primary)]"
                />
                <button
                  onClick={() => {
                    const next = formData.medium.filter((_: any, idx: number) => idx !== i);
                    setFormData({ ...formData, medium: next });
                  }}
                  className="text-rose-500 hover:text-rose-600 p-0.5"
                >
                  <Trash2 size={12} className="micro-icon" />
                </button>
              </div>
              <input
                type="password"
                placeholder="Medium Integration Token"
                value={acc.token}
                onChange={(e) => {
                  const next = [...formData.medium];
                  next[i].token = e.target.value;
                  setFormData({ ...formData, medium: next });
                }}
                className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
            </div>
          ))}
          <button
            onClick={handleAddMedium}
            className="w-full py-1.5 rounded border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-medium flex items-center justify-center gap-1"
          >
            <Plus size={12} className="micro-icon" />
            <span>Añadir Token de Medium</span>
          </button>
        </div>
      )}

      {/* Micro.blog Editor */}
      {activeAccountTab === 'mb' && (
        <div className="space-y-2">
          {formData.microblog?.map((acc: MicroBlogAccount, i: number) => (
            <div key={i} className="p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Nombre de la cuenta"
                  value={acc.name}
                  onChange={(e) => {
                    const next = [...formData.microblog];
                    next[i].name = e.target.value;
                    setFormData({ ...formData, microblog: next });
                  }}
                  className="font-semibold text-xs bg-transparent border-none focus:outline-hidden text-[var(--color-text-primary)]"
                />
                <button
                  onClick={() => {
                    const next = formData.microblog.filter((_: any, idx: number) => idx !== i);
                    setFormData({ ...formData, microblog: next });
                  }}
                  className="text-rose-500 hover:text-rose-600 p-0.5"
                >
                  <Trash2 size={12} className="micro-icon" />
                </button>
              </div>
              <input
                type="password"
                placeholder="Micro.blog App Token"
                value={acc.app_token}
                onChange={(e) => {
                  const next = [...formData.microblog];
                  next[i].app_token = e.target.value;
                  setFormData({ ...formData, microblog: next });
                }}
                className="w-full px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              />
            </div>
          ))}
          <button
            onClick={handleAddMicroBlog}
            className="w-full py-1.5 rounded border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-medium flex items-center justify-center gap-1"
          >
            <Plus size={12} className="micro-icon" />
            <span>Añadir Cuenta de Micro.blog</span>
          </button>
        </div>
      )}
    </div>
  );
};
