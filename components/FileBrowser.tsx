"use client";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { getProjects, type Project } from "@/lib/sanity";
import P5Sketch from './P5Sketch';
import { t, border } from '@/lib/theme';
import { motion } from 'framer-motion';

export default function FileBrowser({ 
  onStatusChange,
  initialProjectId,
  onProjectView,
  onCloseProject,
}: { 
  onStatusChange?: (text: string) => void;
  initialProjectId?: string | null;
  onProjectView?: (projectTitle: string | null) => void;
  onCloseProject?: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "client" | "creative" | "personal">("all");
  const [selectedProject, setSelectedProject]   = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject]     = useState<Project | null>(null);
  const [viewingProject, setViewingProject]     = useState<Project | null>(null);
  const [lightboxImage, setLightboxImage]       = useState<string | null>(null);
  const [containerWidth, setContainerWidth]     = useState(0);
  const [projects, setProjects]                 = useState<Project[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [isMobile, setIsMobile]                 = useState(false);
  const [sketchKey, setSketchKey]               = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    if (initialProjectId && projects.length > 0 && !viewingProject) {
      const project = projects.find(p => p._id === initialProjectId);
      if (project) setViewingProject(project);
    }
  }, [initialProjectId, projects, viewingProject]);

  useEffect(() => { onProjectView?.(viewingProject?.title || null); }, [viewingProject, onProjectView]);
  useEffect(() => { setSketchKey(0); }, [viewingProject]);

  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter(p => p.subcategory === selectedCategory);

  const projectToShow = selectedProject || hoveredProject;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setContainerWidth(container.offsetWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [viewingProject]);

  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(
        hoveredProject
          ? hoveredProject.shortDescription
          : "Hover to preview • Click to select • Double-click for details"
      );
    }
  }, [hoveredProject, onStatusChange]);

  const isDesktopLayout = containerWidth >= 900;

  // Shared styles
  const panelStyle  = { backgroundColor: t.bgInner,  color: t.text, ...border.inset };
  const buttonStyle = { backgroundColor: t.bgInner, color: t.text, ...border.button.raised };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={panelStyle}>
        <p className="text-sm opacity-60">Loading projects...</p>
      </div>
    );
  }

  if (viewingProject) {
    return (
      <div ref={containerRef} className="h-full flex flex-col" style={{ backgroundColor: t.bgInner, color: t.text }}>
        {/* Toolbar */}
        <div className="flex gap-1 pb-1 shrink-0" style={{ backgroundColor: t.bgWindow }}>
          <button
            onClick={() => { setViewingProject(null); onCloseProject?.(); }}
            className="px-6 py-1 text-sm cursor-pointer border hover:brightness-110 transition-all"
            style={buttonStyle}
          >
            ← Back
          </button>
        </div>

        {/* Mobile/Tablet: Vertical Stack */}
        {!isDesktopLayout && (
          <div className="p-6 overflow-auto flex-1">
            <h1 className="text-4xl font-serif mb-4">{viewingProject.title}</h1>
            <div className="text-sm space-y-1 mb-6">
              {viewingProject.projectType && <p><strong>Project Type:</strong> {viewingProject.projectType}</p>}
              {viewingProject.client       && <p><strong>Client:</strong>       {viewingProject.client}</p>}
              {viewingProject.role         && <p><strong>Role:</strong>         {viewingProject.role}</p>}
              {viewingProject.design       && <p><strong>Design:</strong>       {viewingProject.design}</p>}
              {viewingProject.development  && <p><strong>Development:</strong>  {viewingProject.development}</p>}
              {viewingProject.year         && <p><strong>Year:</strong>         {viewingProject.year}</p>}
              {viewingProject.link && (
                <p>
                  <strong>Link:</strong>{" "}
                  <a href={viewingProject.link} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                    {viewingProject.link.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </p>
              )}
            </div>
            <p className="text-sm leading-relaxed mb-6">{viewingProject.longDescription}</p>

            {viewingProject.p5Code ? (
              <div className="space-y-4">
                <div className="h-100 border" style={panelStyle}>
                  <P5Sketch key={sketchKey} code={viewingProject.p5Code} />
                </div>
                <button
                  onClick={() => setSketchKey(prev => prev + 1)}
                  className="w-full px-6 py-2 text-sm border cursor-pointer hover:brightness-110 transition-all"
                  style={buttonStyle}
                >
                  🔄 Restart Sketch
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {viewingProject.images?.filter(img => img && img.url).map((img, i) => (
                  <div key={i} className="border p-1" style={panelStyle}>
                    {img._type === 'file' ? (
                      <video src={img.url} controls loop muted autoPlay playsInline className="w-full" />
                    ) : (
                      <img src={img.url} alt="" className="w-full cursor-pointer hover:opacity-90" onClick={() => setLightboxImage(img.url)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop: Side by side */}
        {isDesktopLayout && (
          <div className="flex flex-1 overflow-hidden border" style={panelStyle}>
            <div className="w-1/2 overflow-y-auto flex flex-col">
              <div className="p-8 flex flex-col flex-1">
                <h1 className="text-6xl font-serif mb-8 leading-tight">{viewingProject.title}</h1>
                <div className="text-sm font-mono space-y-3 mb-8">
                  {viewingProject.projectType && <div><div className="opacity-60 mb-1">[PROJECT TYPE]</div><div>{viewingProject.projectType}</div></div>}
                  {viewingProject.client       && <div><div className="opacity-60 mb-1">[CLIENT]</div><div>{viewingProject.client}</div></div>}
                  {viewingProject.role         && <div><div className="opacity-60 mb-1">[ROLE]</div><div>{viewingProject.role}</div></div>}
                  {viewingProject.design       && <div><div className="opacity-60 mb-1">[DESIGN]</div><div>{viewingProject.design}</div></div>}
                  {viewingProject.development  && <div><div className="opacity-60 mb-1">[DEVELOPMENT]</div><div>{viewingProject.development}</div></div>}
                  <div><div className="opacity-60 mb-1">[YEAR]</div><div>{viewingProject.year}</div></div>
                  {viewingProject.link && (
                    <div>
                      <div className="opacity-60 mb-1">[LINK]</div>
                      <a href={viewingProject.link} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                        {viewingProject.link.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                </div>
                <p className="text-base leading-relaxed mt-auto">{viewingProject.longDescription}</p>
              </div>
            </div>

            <div className="w-1/2 overflow-y-auto border-l" style={{ borderLeftColor: t.borderDark }}>
              <div className="p-8 space-y-6">
                {viewingProject.p5Code ? (
                  <div className="space-y-4">
                    <div className="h-125 border p-1" style={panelStyle}>
                      <P5Sketch key={sketchKey} code={viewingProject.p5Code} />
                    </div>
                    <button
                      onClick={() => setSketchKey(prev => prev + 1)}
                      className="w-full px-6 py-2 text-sm border cursor-pointer hover:brightness-110 transition-all"
                      style={buttonStyle}
                    >
                      🔄 Restart Sketch
                    </button>
                  </div>
                ) : (
                  viewingProject.images?.filter(img => img && img.url).map((img, i) => (
                    <div key={i}>
                      {img._type === 'file' ? (
                        <video src={img.url} controls loop muted autoPlay playsInline className="w-full" style={{ maxHeight: '600px' }} />
                      ) : (
                        <div className="cursor-pointer hover:opacity-90" onClick={() => setLightboxImage(img.url)}>
                          <img src={img.url} alt="" className="w-full" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <>
            <div className="fixed inset-0 bg-black/90 z-50" onClick={() => setLightboxImage(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
              <div className="relative w-full h-full flex items-center justify-center">
                {(() => {
                  const isVideo = viewingProject?.images?.find(img => img.url === lightboxImage)?._type === 'file';
                  return isVideo ? (
                    <video src={lightboxImage} controls loop autoPlay className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <img src={lightboxImage} alt="" className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
                  );
                })()}

                {viewingProject?.images && viewingProject.images.length > 1 && (() => {
                  const validImages  = viewingProject.images.filter(img => img && img.url);
                  const currentIndex = validImages.findIndex(img => img.url === lightboxImage);
                  const lbBtnStyle   = isMobile
                    ? {}
                    : { backgroundColor: t.bgInner, color: t.text, ...border.raised };

                  return (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setLightboxImage(validImages[currentIndex === 0 ? validImages.length - 1 : currentIndex - 1].url); }}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center cursor-pointer border ${isMobile ? 'text-white/80 hover:text-white' : 'hover:brightness-110'}`}
                        style={{ fontWeight: 100, fontSize: isMobile ? '48px' : '32px', ...lbBtnStyle }}
                      >‹</button>

                      <button
                        onClick={(e) => { e.stopPropagation(); setLightboxImage(validImages[currentIndex === validImages.length - 1 ? 0 : currentIndex + 1].url); }}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center cursor-pointer border ${isMobile ? 'text-white/80 hover:text-white' : 'hover:brightness-110'}`}
                        style={{ fontWeight: 100, fontSize: isMobile ? '48px' : '32px', ...lbBtnStyle }}
                      >›</button>

                      <div
                        className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-mono border ${isMobile ? 'text-white/80' : ''}`}
                        style={isMobile ? {} : { backgroundColor: t.bgInner, color: t.text, ...border.raised }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {currentIndex + 1} / {validImages.length}
                      </div>
                    </>
                  );
                })()}

                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
                  className={`absolute top-4 right-4 flex items-center justify-center cursor-pointer border ${isMobile ? 'w-10 h-10 text-white/80 hover:text-white' : 'w-8 h-8 hover:brightness-110'}`}
                  style={{ fontWeight: 100, fontSize: isMobile ? '36px' : '20px', ...(isMobile ? {} : { backgroundColor: t.bgInner, color: t.text, ...border.raised }) }}
                >×</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Tab style helper
  const tabStyle = (category: string) => {
    const active = selectedCategory === category;
    return active ? {
      backgroundColor: t.bgInner,
      color: t.text,
      ...border.button.raised,
    } : {
      backgroundColor: 'transparent',
      color: t.text,
      borderColor: 'transparent',
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      {!isMobile && (
      <div className="flex overflow-visible pt-0.5 pl-0.5" style={{ backgroundColor: t.bgWindow }}>
        {(['all', 'client', 'creative', 'personal'] as const).map((cat) => {
          const active = selectedCategory === cat;
          const label = cat === 'all' ? 'All Projects' : cat === 'client' ? 'Client Work' : cat === 'creative' ? 'Creative Code' : 'Personal';
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`relative px-4 py-0.5 text-sm cursor-pointer border transition-colors ${!active ? 'hover:outline hover:outline-dashed' : ''}`}
              style={{
                color: t.text,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                outlineColor: t.borderLight,
              }}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -inset-0.5 border"
                  style={{ backgroundColor: t.bgInner, ...border.button.raised }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    )}

      <div className="flex flex-1 overflow-hidden gap-1 mt-0.5">
        {/* Table */}
        <div
          className="flex-1 overflow-auto border"
          style={{ backgroundColor: t.bgInner, color: t.text, ...border.inset }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedProject(null); }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b sticky top-0"
                style={{ backgroundColor: t.bgWindow, borderBottomColor: t.borderDark }}
              >
                {!isMobile && (
                  <th className="p-0 border-r font-normal w-8" style={{ borderRightColor: t.borderDark }}>
                    <div className="py-1 px-1 border" style={{ backgroundColor: t.bgWindow, ...border.tableHeader }}>&nbsp;</div>
                  </th>
                )}
                {!isMobile && (
                  <th className="p-0 border-r font-normal" style={{ borderRightColor: t.borderDark }}>
                    <div className="py-1 px-2 border text-left" style={{ backgroundColor: t.bgWindow, ...border.tableHeader }}>Client</div>
                  </th>
                )}
                <th className="p-0 border-r font-normal" style={{ borderRightColor: t.borderDark }}>
                  <div className="py-1 px-2 border text-left" style={{ backgroundColor: t.bgWindow, ...border.tableHeader }}>Project</div>
                </th>
                {!isMobile && (
                  <th className="p-0 border-r font-normal" style={{ borderRightColor: t.borderDark }}>
                    <div className="py-1 px-2 border text-left" style={{ backgroundColor: t.bgWindow, ...border.tableHeader }}>Collaborators</div>
                  </th>
                )}
                {!isMobile && (
                  <th className="p-0 border-r font-normal" style={{ borderRightColor: t.borderDark }}>
                    <div className="py-1 px-2 border text-left" style={{ backgroundColor: t.bgWindow, ...border.tableHeader }}>Format</div>
                  </th>
                )}
                <th className="p-0 font-normal">
                  <div className="py-1 px-2 border text-left" style={{ backgroundColor: t.bgWindow, ...border.tableHeader }}>Year</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project._id}
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onClick={() => setSelectedProject(project)}
                  onDoubleClick={() => setViewingProject(project)}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedProject?._id === project._id ? t.bgWindow : 'transparent',
                    outline: (selectedProject?._id === project._id || hoveredProject?._id === project._id)
                      ? `1px dashed ${t.borderDark}` : 'none',
                  }}
                >
                  {!isMobile && (
                    <td className="p-1 text-center">
                      {project.isPinned && <img src="/icons/star.png" alt="Featured" className="w-4 h-4 mx-auto" />}
                    </td>
                  )}
                  {!isMobile && <td className="p-2">{project.client || '-'}</td>}
                  <td className="p-2">{project.title}</td>
                  {!isMobile && <td className="p-2">{project.collaborators || '-'}</td>}
                  {!isMobile && <td className="p-2">{project.format}</td>}
                  <td className="p-2">{project.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preview Pane */}
        {!isMobile && (
          <div className="w-80 overflow-hidden border" style={{ backgroundColor: t.bgInner, ...border.inset }}>
            {!projectToShow && (
              <div 
                className="flex flex-col items-center justify-center h-full p-4 text-center gap-3"
                style={{ color: t.textMuted }}
              >
                <img src="/projects.png" alt="" className="w-10 h-10 opacity-30" />
                <p className="text-xs font-mono leading-relaxed opacity-60">
                  — no item selected —
                </p>
                <p className="text-xs opacity-40">
                  hover to preview<br />click to select
                </p>
              </div>
            )}
            {projectToShow && <ImageCarousel images={projectToShow.images} />}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageCarousel({ images }: { images: any[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const previousImagesRef = React.useRef<string>('');

  const validImages = React.useMemo(() => {
    if (!images || !Array.isArray(images)) return [];
    return images.filter(img => img && typeof img === 'object' && img.url && typeof img.url === 'string');
  }, [images]);

  React.useEffect(() => {
    const key = validImages.map(img => img.url).join(',');
    if (key !== previousImagesRef.current) {
      previousImagesRef.current = key;
      setCurrentIndex(0);
    }
  }, [validImages]);

  React.useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex(prev => (prev + 1) % validImages.length), 1750);
    return () => clearInterval(interval);
  }, [validImages.length]);

  if (validImages.length === 0) return <div className="flex items-center justify-center h-full text-sm opacity-60">No images available</div>;

  const currentImage = validImages[currentIndex];
  if (!currentImage?.url) return <div className="flex items-center justify-center h-full text-sm opacity-60">Image error</div>;

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: t.bgInner }}>
      {currentImage._type === 'file' ? (
        <video key={currentImage.url} src={currentImage.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
      ) : (
        <img src={currentImage.url} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );
}
