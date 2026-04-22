"use client";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { getProjects, type Project } from "@/lib/sanity";

export default function FileBrowser({ 
  onStatusChange,
  initialProjectId,
  onProjectView
}: { 
  onStatusChange?: (text: string) => void;
  initialProjectId?: string | null;
  onProjectView?: (projectTitle: string | null) => void;
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch projects from Sanity
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

  // Auto-open project if initialProjectId is provided
  useEffect(() => {
    if (initialProjectId && projects.length > 0) {
      const project = projects.find(p => p._id === initialProjectId);
      if (project) {
        setViewingProject(project);
      }
    }
  }, [initialProjectId, projects]);

  // Update parent when viewing project changes
  useEffect(() => {
    onProjectView?.(viewingProject?.title || null);
  }, [viewingProject, onProjectView]);

  // Filter by subcategory - "all" shows everything
  const filteredProjects = selectedCategory === "all" 
    ? projects 
    : projects.filter(p => p.subcategory === selectedCategory);

  const projectToShow = selectedProject || hoveredProject;

  // Measure container width for responsive layout
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

  // Update status text with shortDescription
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
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-sm text-grey-dark">Loading projects...</p>
      </div>
    );
  }

  if (viewingProject) {
  return (
    <div ref={containerRef} className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="bg-grey-light flex gap-1 pb-1 shrink-0">
        <button
          onClick={() => setViewingProject(null)}
          className="px-6 py-1 text-sm cursor-pointer border border-t-white border-l-white border-r-grey-dark border-b-grey-dark bg-transparent"
        >
          ← Back
        </button>
      </div>

      {/* Mobile/Tablet: Vertical Stack */}
      {!isDesktopLayout && (
        <div className="p-6 overflow-auto flex-1">
          <h1 className="text-4xl font-serif mb-4">{viewingProject.title}</h1>
          
          <div className="text-sm space-y-1 mb-6">
            {viewingProject.client && <p><strong>Client:</strong> {viewingProject.client}</p>}
            {viewingProject.role && <p><strong>Role:</strong> {viewingProject.role}</p>}
            {viewingProject.collaborators && <p><strong>Collaborators:</strong> {viewingProject.collaborators}</p>}
            {viewingProject.format && <p><strong>Format:</strong> {viewingProject.format}</p>}
            {viewingProject.year && <p><strong>Year:</strong> {viewingProject.year}</p>}
          </div>

          <p className="text-sm leading-relaxed mb-6">{viewingProject.longDescription}</p>

          <div className="space-y-4">
            {viewingProject.images?.filter(img => img && img.url).map((img, i) => (
              <div key={i} className="border border-t-black border-l-black border-b-grey-dark border-r-grey-dark bg-grey-light p-1">
                <img
                  src={img.url}
                  alt=""
                  className="w-full cursor-pointer hover:opacity-90"
                  onClick={() => setLightboxImage(img.url)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop: Fixed Left Sidebar + Scrolling Right Images */}
      {isDesktopLayout && (
        <div className="flex flex-1 overflow-hidden border border-t-black border-l-black border-b-grey-dark border-r-grey-dark bg-white">
          {/* Left Column - Scrollable Text */}
          <div className="w-1/2 overflow-y-auto flex flex-col">
            <div className="p-8 flex flex-col flex-1">
              <h1 className="text-6xl font-serif mb-8 leading-tight">{viewingProject.title}</h1>
              
              <div className="text-sm font-mono space-y-1 mb-8">
                {viewingProject.projectType && (
                  <div className="flex">
                    <span className="w-40">[PROJECT TYPE]</span>
                    <span>{viewingProject.projectType}</span>
                  </div>
                )}
                {viewingProject.client && (
                  <div className="flex">
                    <span className="w-40">[CLIENT]</span>
                    <span>{viewingProject.client}</span>
                  </div>
                )}
                {viewingProject.role && (
                  <div className="flex">
                    <span className="w-40">[ROLE]</span>
                    <span>{viewingProject.role}</span>
                  </div>
                )}
                {viewingProject.design && (
                  <div className="flex">
                    <span className="w-40">[DESIGN]</span>
                    <span>{viewingProject.design}</span>
                  </div>
                )}
                {viewingProject.development && (
                  <div className="flex">
                    <span className="w-40">[DEVELOPMENT]</span>
                    <span>{viewingProject.development}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-40">[YEAR]</span>
                  <span>{viewingProject.year}</span>
                </div>
                {viewingProject.link && (
                  <div className="flex">
                    <span className="w-40">[LINK]</span>
                    <a href={viewingProject.link} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                      {viewingProject.link.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Push description to bottom */}
              <p className="text-base leading-relaxed mt-auto">{viewingProject.longDescription}</p>
            </div>
          </div>

          {/* Right Column - Scrolling Images */}
          <div className="w-1/2 overflow-y-auto border-l border-grey-dark">
            <div className="p-8 space-y-6">
              {viewingProject.images && Array.isArray(viewingProject.images) && viewingProject.images.length > 0 ? (
                viewingProject.images
                  .filter(img => img && img.url)
                  .map((img, i) => (
                    <div 
                      key={i} 
                      className="cursor-pointer hover:opacity-90"
                      onClick={() => setLightboxImage(img.url)}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full"
                      />
                    </div>
                  ))
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-grey-dark">
                  No images available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/90 z-50" 
            onClick={() => setLightboxImage(null)} 
          />
          
          {/* Content Container */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Main Image */}
              <img 
                src={lightboxImage} 
                alt="" 
                className="max-w-[90vw] max-h-[85vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Navigation Arrows */}
              {viewingProject && viewingProject.images && viewingProject.images.length > 1 && (() => {
                const validImages = viewingProject.images.filter(img => img && img.url);
                const currentIndex = validImages.findIndex(img => img.url === lightboxImage);
                
                return (
                  <>
                    {/* Left Arrow */}
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

                    {/* Right Arrow */}
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

                    {/* Image Counter */}
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

              {/* Close Button */}
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
    {/* Category Tabs - Desktop only */}
    {!isMobile && (
      <div className="bg-grey-light flex gap-1">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-1 text-sm cursor-pointer ${
            selectedCategory === "all"
              ? "border border-t-white border-l-white border-r-grey-dark border-b-grey-dark bg-transparent"
              : ""
          }`}
        >
          All Projects
        </button>
        <button
          onClick={() => setSelectedCategory("client")}
          className={`px-4 py-1 text-sm cursor-pointer ${
            selectedCategory === "client"
              ? "border border-t-white border-l-white border-r-grey-dark border-b-grey-dark bg-transparent"
              : ""
          }`}
        >
          Client Work
        </button>
        <button
          onClick={() => setSelectedCategory("creative")}
          className={`px-4 py-1 text-sm cursor-pointer ${
            selectedCategory === "creative"
              ? "border border-t-white border-l-white border-r-grey-dark border-b-grey-dark bg-transparent"
              : ""
          }`}
        >
          Creative Code
        </button>
        <button
          onClick={() => setSelectedCategory("personal")}
          className={`px-4 py-1 text-sm cursor-pointer ${
            selectedCategory === "personal"
              ? "border border-t-white border-l-white border-r-grey-dark border-b-grey-dark bg-transparent"
              : ""
          }`}
        >
          Personal
        </button>
      </div>
    )}

    <div className="h-1" />

    <div className="flex flex-1 overflow-hidden gap-1">
        {/* Table */}
        <div 
          className="flex-1 overflow-auto bg-white border border-t-black border-l-black border-b-grey-dark border-r-grey-dark"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProject(null);
            }
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-grey-light border-b border-grey-dark sticky top-0">
                {/* Star/Pin column - Desktop only */}
                {!isMobile && (
                  <th className="p-0 border-r border-grey-dark font-normal w-8">
                    <div className="py-1 px-1 bg-grey-light border border-t-white border-l-white border-b-grey-dark border-r-grey-dark">
                      &nbsp;
                    </div>
                  </th>
                )}
                
                {/* Client column - Desktop only */}
                {!isMobile && (
                  <th className="p-0 border-r border-grey-dark font-normal">
                    <div className="py-1 px-2 bg-grey-light border border-t-white border-l-white border-b-grey-dark border-r-grey-dark text-left">
                      Client
                    </div>
                  </th>
                )}
                
                {/* Project column - Always visible */}
                <th className="p-0 border-r border-grey-dark font-normal">
                  <div className="py-1 px-2 bg-grey-light border border-t-white border-l-white border-b-grey-dark border-r-grey-dark text-left">
                    Project
                  </div>
                </th>
                
                {/* Collaborators column - Desktop only */}
                {!isMobile && (
                  <th className="p-0 border-r border-grey-dark font-normal">
                    <div className="py-1 px-2 bg-grey-light border border-t-white border-l-white border-b-grey-dark border-r-grey-dark text-left">
                      Collaborators
                    </div>
                  </th>
                )}
                
                {/* Format column - Desktop only */}
                {!isMobile && (
                  <th className="p-0 border-r border-grey-dark font-normal">
                    <div className="py-1 px-2 bg-grey-light border border-t-white border-l-white border-b-grey-dark border-r-grey-dark text-left">
                      Format
                    </div>
                  </th>
                )}
                
                {/* Year column - Always visible */}
                <th className="p-0 font-normal">
                  <div className="py-1 px-2 bg-grey-light border border-t-white border-l-white border-b-grey-dark border-r-grey-dark text-left">
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
                  className={`cursor-pointer ${
                    selectedProject?._id === project._id 
                      ? 'bg-grey-light outline-1 outline-dashed outline-grey-dark' 
                      : hoveredProject?._id === project._id
                      ? 'outline-1 outline-dashed outline-grey-dark'
                      : ''
                  }`}
                >
                  {/* Star/Pin cell - Desktop only */}
                  {!isMobile && (
                    <td className="p-1 text-center">
                      {project.isPinned && (
                        <img src="/icons/star.png" alt="Featured" className="w-4 h-4 mx-auto" />
                      )}
                    </td>
                  )}
                  
                  {/* Client cell - Desktop only */}
                  {!isMobile && <td className="p-2">{project.client || '-'}</td>}
                  
                  {/* Project cell - Always visible */}
                  <td className="p-2">{project.title}</td>
                  
                  {/* Collaborators cell - Desktop only */}
                  {!isMobile && <td className="p-2">{project.collaborators || '-'}</td>}
                  
                  {/* Format cell - Desktop only */}
                  {!isMobile && <td className="p-2">{project.format}</td>}
                  
                  {/* Year cell - Always visible */}
                  <td className="p-2">{project.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preview Pane - Desktop only */}
        {!isMobile && (
          <div className="w-80 bg-white overflow-hidden border border-t-black border-l-black border-b-grey-dark border-r-grey-dark">
            {!projectToShow && (
              <div className="flex items-center justify-center h-full text-sm text-grey-dark p-4 text-center">
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

// Image Carousel Component
function ImageCarousel({ images }: { images: any[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const previousImagesRef = React.useRef<string>('');
  
  // Filter out null/undefined images and ensure they have url
  const validImages = React.useMemo(() => {
    if (!images || !Array.isArray(images)) return [];
    return images.filter(img => img && typeof img === 'object' && img.url && typeof img.url === 'string');
  }, [images]);

  // Only reset index when the actual image URLs change
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
      <div className="flex items-center justify-center h-full text-sm text-grey-dark">
        No images available
      </div>
    );
  }

  // Extra safety check
  const currentImage = validImages[currentIndex];
  if (!currentImage || !currentImage.url) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-grey-dark">
        Image error
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-grey-mid flex items-center justify-center">
      <img 
        src={currentImage.url} 
        alt="" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}