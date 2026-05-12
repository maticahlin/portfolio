"use client";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { getProjects, type Project } from "@/lib/sanity";
import P5Sketch from './P5Sketch';

export default function FileBrowser({ 
  onStatusChange,
  initialProjectId,
  onProjectView,
  onCloseProject,
  theme = 'grey'
}: { 
  onStatusChange?: (text: string) => void;
  initialProjectId?: string | null;
  onProjectView?: (projectTitle: string | null) => void;
  onCloseProject?: () => void;
  theme?: 'grey' | 'dark';
}) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "client" | "creative" | "personal">("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sketchKey, setSketchKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const bgColor = theme === 'dark' ? '#474747' : '#e6e6e6';
  const innerBg = theme === 'dark' ? '#323232' : '#ffffff';
  const textColor = theme === 'dark' ? '#E2E2E2' : '#000000';
  const borderLight = theme === 'dark' ? '#9F9F9F' : 'white';
  const borderDark = theme === 'dark' ? '#000000' : '#a6a6a6';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      if (project) {
        setViewingProject(project);
      }
    }
  }, [initialProjectId, projects, viewingProject]);

  useEffect(() => {
    onProjectView?.(viewingProject?.title || null);
  }, [viewingProject, onProjectView]);

  useEffect(() => {
    setSketchKey(0);
  }, [viewingProject]);

  const filteredProjects = selectedCategory === "all" 
    ? projects 
    : projects.filter(p => p.subcategory === selectedCategory);

  const projectToShow = selectedProject || hoveredProject;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setContainerWidth(container.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [viewingProject]);

  React.useEffect(() => {
    if (onStatusChange) {
      const statusText = hoveredProject 
        ? hoveredProject.shortDescription 
        : "Hover to preview • Click to select • Double-click for details";
      onStatusChange(statusText);
    }
  }, [hoveredProject, onStatusChange]);

  const isDesktopLayout = containerWidth >= 900;

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center h-full"
        style={{ backgroundColor: innerBg, color: textColor }}
      >
        <p className="text-sm opacity-60">Loading projects...</p>
      </div>
    );
  }

  if (viewingProject) {
    return (
      <div 
        ref={containerRef} 
        className="h-full flex flex-col"
        style={{ backgroundColor: innerBg, color: textColor }}
      >
        {/* Toolbar */}
        <div 
          className="flex gap-1 pb-1 shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <button
            onClick={() => {
              setViewingProject(null);
              onCloseProject?.();
            }}
            className="px-6 py-1 text-sm cursor-pointer border hover:brightness-110 transition-all"
            style={{
              backgroundColor: innerBg,
              color: textColor,
              borderTopColor: borderLight,
              borderLeftColor: borderLight,
              borderRightColor: borderDark,
              borderBottomColor: borderDark
            }}
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
              {viewingProject.client && <p><strong>Client:</strong> {viewingProject.client}</p>}
              {viewingProject.role && <p><strong>Role:</strong> {viewingProject.role}</p>}
              {viewingProject.design && <p><strong>Design:</strong> {viewingProject.design}</p>}
              {viewingProject.development && <p><strong>Development:</strong> {viewingProject.development}</p>}
              {viewingProject.year && <p><strong>Year:</strong> {viewingProject.year}</p>}
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
                <div className="h-100 border border-t-black border-l-black border-b-grey-dark border-r-grey-dark bg-grey-light p-1">
                  <P5Sketch key={sketchKey} code={viewingProject.p5Code} />
                </div>
                <button
                  onClick={() => setSketchKey(prev => prev + 1)}
                  className="w-full px-6 py-2 text-sm bg-grey-light border border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] cursor-pointer hover:bg-grey-mid transition-colors"
                >
                  🔄 Restart Sketch
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {viewingProject.images?.filter(img => img && img.url).map((img, i) => (
                  <div key={i} className="border border-t-black border-l-black border-b-grey-dark border-r-grey-dark bg-grey-light p-1">
                    {img._type === 'file' ? (
                      <video 
                        src={img.url} 
                        controls 
                        loop 
                        muted
                        autoPlay
                        playsInline
                        className="w-full"
                      />
                    ) : (
                      <img
                        src={img.url}
                        alt=""
                        className="w-full cursor-pointer hover:opacity-90"
                        onClick={() => setLightboxImage(img.url)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop */}
        {isDesktopLayout && (
          <div 
            className="flex flex-1 overflow-hidden border"
            style={{
              backgroundColor: innerBg,
              borderTopColor: borderDark,
              borderLeftColor: borderDark,
              borderBottomColor: borderLight,
              borderRightColor: borderLight
            }}
          >
            <div className="w-1/2 overflow-y-auto flex flex-col">
              <div className="p-8 flex flex-col flex-1">
                <h1 className="text-6xl font-serif mb-8 leading-tight">{viewingProject.title}</h1>
                
                <div className="text-sm font-mono space-y-3 mb-8">
                  {viewingProject.projectType && (
                    <div>
                      <div className="opacity-60 mb-1">[PROJECT TYPE]</div>
                      <div>{viewingProject.projectType}</div>
                    </div>
                  )}
                  {viewingProject.client && (
                    <div>
                      <div className="opacity-60 mb-1">[CLIENT]</div>
                      <div>{viewingProject.client}</div>
                    </div>
                  )}
                  {viewingProject.role && (
                    <div>
                      <div className="opacity-60 mb-1">[ROLE]</div>
                      <div>{viewingProject.role}</div>
                    </div>
                  )}
                  {viewingProject.design && (
                    <div>
                      <div className="opacity-60 mb-1">[DESIGN]</div>
                      <div>{viewingProject.design}</div>
                    </div>
                  )}
                  {viewingProject.development && (
                    <div>
                      <div className="opacity-60 mb-1">[DEVELOPMENT]</div>
                      <div>{viewingProject.development}</div>
                    </div>
                  )}
                  <div>
                    <div className="opacity-60 mb-1">[YEAR]</div>
                    <div>{viewingProject.year}</div>
                  </div>
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

            <div 
              className="w-1/2 overflow-y-auto border-l"
              style={{ borderLeftColor: borderDark }}
            >
              <div className="p-8 space-y-6">
                {viewingProject.p5Code ? (
                  <div className="space-y-4">
                    <div className="h-125 border border-t-black border-l-black border-b-grey-dark border-r-grey-dark bg-grey-light p-1">
                      <P5Sketch key={sketchKey} code={viewingProject.p5Code} />
                    </div>
                    <button
                      onClick={() => setSketchKey(prev => prev + 1)}
                      className="w-full px-6 py-2 text-sm bg-grey-light border border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] cursor-pointer hover:bg-grey-mid transition-colors active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
                    >
                      🔄 Restart Sketch
                    </button>
                  </div>
                ) : (
                  viewingProject.images && Array.isArray(viewingProject.images) && viewingProject.images.length > 0 ? (
                    viewingProject.images
                      .filter(img => img && img.url)
                      .map((img, i) => (
                        <div key={i}>
                          {img._type === 'file' ? (
                            <video 
                              src={img.url} 
                              controls 
                              loop 
                              muted
                              autoPlay
                              playsInline
                              className="w-full"
                              style={{ maxHeight: '600px' }}
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:opacity-90"
                              onClick={() => setLightboxImage(img.url)}
                            >
                              <img src={img.url} alt="" className="w-full" />
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm opacity-60">
                      No images available
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <>
            <div 
              className="fixed inset-0 bg-black/90 z-50" 
              onClick={() => setLightboxImage(null)} 
            />
            
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {(() => {
                  const currentItem = viewingProject?.images?.find(img => img.url === lightboxImage);
                  const isVideo = currentItem?._type === 'file';
                  
                  return isVideo ? (
                    <video
                      src={lightboxImage}
                      controls
                      loop
                      autoPlay
                      className="max-w-[90vw] max-h-[85vh] object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img 
                      src={lightboxImage} 
                      alt="" 
                      className="max-w-[90vw] max-h-[85vh] object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  );
                })()}

                {viewingProject && viewingProject.images && viewingProject.images.length > 1 && (() => {
                  const validImages = viewingProject.images.filter(img => img && img.url);
                  const currentIndex = validImages.findIndex(img => img.url === lightboxImage);
                  
                  return (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const prevIndex = currentIndex === 0 ? validImages.length - 1 : currentIndex - 1;
                          setLightboxImage(validImages[prevIndex].url);
                        }}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer ${
                          isMobile 
                            ? 'w-12 h-12 text-white/80 hover:text-white' 
                            : 'w-12 h-12 bg-grey-light border border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] hover:bg-white active:border-t-black active:border-l-black active:border-r-white active:border-b-white text-black'
                        }`}
                        style={{ fontWeight: 100, fontSize: isMobile ? '48px' : '32px' }}
                      >
                        ‹
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextIndex = currentIndex === validImages.length - 1 ? 0 : currentIndex + 1;
                          setLightboxImage(validImages[nextIndex].url);
                        }}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer ${
                          isMobile 
                            ? 'w-12 h-12 text-white/80 hover:text-white' 
                            : 'w-12 h-12 bg-grey-light border border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] hover:bg-white active:border-t-black active:border-l-black active:border-r-white active:border-b-white text-black'
                        }`}
                        style={{ fontWeight: 100, fontSize: isMobile ? '48px' : '32px' }}
                      >
                        ›
                      </button>

                      <div 
                        className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-mono ${
                          isMobile
                            ? 'text-white/80'
                            : 'bg-grey-light border border-white text-black'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {currentIndex + 1} / {validImages.length}
                      </div>
                    </>
                  );
                })()}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(null);
                  }}
                  className={`absolute top-4 right-4 flex items-center justify-center cursor-pointer ${
                    isMobile
                      ? 'w-10 h-10 text-white/80 hover:text-white'
                      : 'w-8 h-8 bg-grey-light border border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] hover:bg-white active:border-t-black active:border-l-black active:border-r-white active:border-b-white text-black'
                  }`}
                  style={{ fontWeight: 100, fontSize: isMobile ? '36px' : '20px' }}
                >
                  ×
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      {!isMobile && (
        <div 
          className="flex gap-1"
          style={{ backgroundColor: bgColor }}
        >
          <button
            onClick={() => setSelectedCategory("all")}
            className="px-4 py-1 text-sm cursor-pointer border hover:brightness-110 transition-all"
            style={{
              backgroundColor: selectedCategory === "all" ? innerBg : 'transparent',
              color: textColor,
              borderTopColor: selectedCategory === "all" ? borderLight : 'transparent',
              borderLeftColor: selectedCategory === "all" ? borderLight : 'transparent',
              borderRightColor: selectedCategory === "all" ? borderDark : 'transparent',
              borderBottomColor: selectedCategory === "all" ? borderDark : 'transparent'
            }}
          >
            All Projects
          </button>
          <button
            onClick={() => setSelectedCategory("client")}
            className="px-4 py-1 text-sm cursor-pointer border hover:brightness-110 transition-all"
            style={{
              backgroundColor: selectedCategory === "client" ? innerBg : 'transparent',
              color: textColor,
              borderTopColor: selectedCategory === "client" ? borderLight : 'transparent',
              borderLeftColor: selectedCategory === "client" ? borderLight : 'transparent',
              borderRightColor: selectedCategory === "client" ? borderDark : 'transparent',
              borderBottomColor: selectedCategory === "client" ? borderDark : 'transparent'
            }}
          >
            Client Work
          </button>
          <button
            onClick={() => setSelectedCategory("creative")}
            className="px-4 py-1 text-sm cursor-pointer border hover:brightness-110 transition-all"
            style={{
              backgroundColor: selectedCategory === "creative" ? innerBg : 'transparent',
              color: textColor,
              borderTopColor: selectedCategory === "creative" ? borderLight : 'transparent',
              borderLeftColor: selectedCategory === "creative" ? borderLight : 'transparent',
              borderRightColor: selectedCategory === "creative" ? borderDark : 'transparent',
              borderBottomColor: selectedCategory === "creative" ? borderDark : 'transparent'
            }}
          >
            Creative Code
          </button>
          <button
            onClick={() => setSelectedCategory("personal")}
            className="px-4 py-1 text-sm cursor-pointer border hover:brightness-110 transition-all"
            style={{
              backgroundColor: selectedCategory === "personal" ? innerBg : 'transparent',
              color: textColor,
              borderTopColor: selectedCategory === "personal" ? borderLight : 'transparent',
              borderLeftColor: selectedCategory === "personal" ? borderLight : 'transparent',
              borderRightColor: selectedCategory === "personal" ? borderDark : 'transparent',
              borderBottomColor: selectedCategory === "personal" ? borderDark : 'transparent'
            }}
          >
            Personal
          </button>
        </div>
      )}

      <div className="h-1" />

      <div className="flex flex-1 overflow-hidden gap-1">
        {/* Table */}
        <div 
          className="flex-1 overflow-auto border"
          style={{
            backgroundColor: innerBg,
            color: textColor,
            borderTopColor: borderDark,
            borderLeftColor: borderDark,
            borderBottomColor: borderLight,
            borderRightColor: borderLight
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProject(null);
            }
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr 
                className="border-b sticky top-0"
                style={{
                  backgroundColor: bgColor,
                  borderBottomColor: borderDark
                }}
              >
                {!isMobile && (
                  <th className="p-0 border-r font-normal w-8" style={{ borderRightColor: borderDark }}>
                    <div 
                      className="py-1 px-1 border"
                      style={{
                        backgroundColor: bgColor,
                        borderTopColor: borderLight,
                        borderLeftColor: borderLight,
                        borderBottomColor: borderDark,
                        borderRightColor: borderDark
                      }}
                    >
                      &nbsp;
                    </div>
                  </th>
                )}
                
                {!isMobile && (
                  <th className="p-0 border-r font-normal" style={{ borderRightColor: borderDark }}>
                    <div 
                      className="py-1 px-2 border text-left"
                      style={{
                        backgroundColor: bgColor,
                        borderTopColor: borderLight,
                        borderLeftColor: borderLight,
                        borderBottomColor: borderDark,
                        borderRightColor: borderDark
                      }}
                    >
                      Client
                    </div>
                  </th>
                )}
                
                <th className="p-0 border-r font-normal" style={{ borderRightColor: borderDark }}>
                  <div 
                    className="py-1 px-2 border text-left"
                    style={{
                      backgroundColor: bgColor,
                      borderTopColor: borderLight,
                      borderLeftColor: borderLight,
                      borderBottomColor: borderDark,
                      borderRightColor: borderDark
                    }}
                  >
                    Project
                  </div>
                </th>
                
                {!isMobile && (
                  <th className="p-0 border-r font-normal" style={{ borderRightColor: borderDark }}>
                    <div 
                      className="py-1 px-2 border text-left"
                      style={{
                        backgroundColor: bgColor,
                        borderTopColor: borderLight,
                        borderLeftColor: borderLight,
                        borderBottomColor: borderDark,
                        borderRightColor: borderDark
                      }}
                    >
                      Collaborators
                    </div>
                  </th>
                )}
                
                {!isMobile && (
                  <th className="p-0 border-r font-normal" style={{ borderRightColor: borderDark }}>
                    <div 
                      className="py-1 px-2 border text-left"
                      style={{
                        backgroundColor: bgColor,
                        borderTopColor: borderLight,
                        borderLeftColor: borderLight,
                        borderBottomColor: borderDark,
                        borderRightColor: borderDark
                      }}
                    >
                      Format
                    </div>
                  </th>
                )}
                
                <th className="p-0 font-normal">
                  <div 
                    className="py-1 px-2 border text-left"
                    style={{
                      backgroundColor: bgColor,
                      borderTopColor: borderLight,
                      borderLeftColor: borderLight,
                      borderBottomColor: borderDark,
                      borderRightColor: borderDark
                    }}
                  >
                    Year
                  </div>
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
                    backgroundColor: selectedProject?._id === project._id ? bgColor : 'transparent',
                    outline: (selectedProject?._id === project._id || hoveredProject?._id === project._id) 
                      ? `1px dashed ${borderDark}` 
                      : 'none'
                  }}
                >
                  {!isMobile && (
                    <td className="p-1 text-center">
                      {project.isPinned && (
                        <img src="/icons/star.png" alt="Featured" className="w-4 h-4 mx-auto" />
                      )}
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
          <div 
            className="w-80 overflow-hidden border"
            style={{
              backgroundColor: innerBg,
              borderTopColor: borderDark,
              borderLeftColor: borderDark,
              borderBottomColor: borderLight,
              borderRightColor: borderLight
            }}
          >
            {!projectToShow && (
              <div className="flex items-center justify-center h-full text-sm opacity-60 p-4 text-center">
                Select a project to preview
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
    const currentImagesKey = validImages.map(img => img.url).join(',');
    if (currentImagesKey !== previousImagesRef.current) {
      previousImagesRef.current = currentImagesKey;
      setCurrentIndex(0);
    }
  }, [validImages]);

  React.useEffect(() => {
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 1750);

    return () => clearInterval(interval);
  }, [validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm opacity-60">
        No images available
      </div>
    );
  }

  const currentImage = validImages[currentIndex];
  if (!currentImage || !currentImage.url) {
    return (
      <div className="flex items-center justify-center h-full text-sm opacity-60">
        Image error
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-grey-mid flex items-center justify-center">
      {currentImage._type === 'file' ? (
        <video 
          key={currentImage.url}
          src={currentImage.url} 
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img 
          src={currentImage.url} 
          alt="" 
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}