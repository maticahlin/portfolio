"use client";

import TopBar from "@/components/TopBar";
import TaskBar from "@/components/TaskBar";
import DesktopIcon from "@/components/DesktopIcon";
import Window from "@/components/Window";
import MailForm from "@/components/MailForm";
import AboutDialog from "@/components/AboutDialog";
import FileBrowser from "@/components/FileBrowser";
import QRGenerator from "@/components/QRGenerator";
import { getProjects, type Project } from "@/lib/sanity";
import { useSearchParams, useRouter } from 'next/navigation';

import { useState, useRef, useEffect } from 'react';

export default function HomeContent() {
  const [showProjects, setShowProjects] = useState(false);
  const [isProjectsMinimized, setIsProjectsMinimized] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [isMailMinimized, setIsMailMinimized] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [previewWindows, setPreviewWindows] = useState<Project[]>([]);
  const [closedPreviews, setClosedPreviews] = useState<Set<string>>(new Set());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectsStatusText, setProjectsStatusText] = useState("Hover to preview • Click to select • Double-click for details");
  const [mailStatusText, setMailStatusText] = useState("Have a project in mind? I'd be happy to learn about it.");
  const [showQR, setShowQR] = useState(false);
  const [isQRMinimized, setIsQRMinimized] = useState(false);
  const [theme, setTheme] = useState<'grey' | 'dark'>('grey');
  const [projectViewTitle, setProjectViewTitle] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);  // ADD THIS
  const [viewingProject, setViewingProject] = useState<Project | null>(null);  // ADD THIS

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Read project from URL on mount/navigation
  useEffect(() => {
    const projectSlug = searchParams.get('project');
    
    if (projectSlug && projects.length > 0) {
      // Find project by matching slug
      const matchingProject = projects.find(p => {
        const pSlug = p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return pSlug === projectSlug;
      });
      
      if (matchingProject) {
        setSelectedProjectId(matchingProject._id);
        setViewingProject(matchingProject);
        setShowProjects(true);
        setActiveWindow("projects");
      }
    } else if (!projectSlug) {
      // Clear project view when URL is cleared
      setViewingProject(null);
      setProjectViewTitle(null);
    }
  }, [searchParams, projects]);

  // Update URL when viewing project changes
  useEffect(() => {
    if (projectViewTitle && showProjects) {
      const slug = projectViewTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const currentSlug = searchParams.get('project');
      
      // Only update if different to avoid loops
      if (currentSlug !== slug) {
        router.push(`/?project=${slug}`, { scroll: false });
      }
    } else if (showProjects && !projectViewTitle) {
      // In project browser but no specific project - clear URL
      const currentSlug = searchParams.get('project');
      if (currentSlug) {
        router.push('/', { scroll: false });
      }
    } else if (!showProjects) {
      // Projects window closed - clear URL
      const currentSlug = searchParams.get('project');
      if (currentSlug) {
        router.push('/', { scroll: false });
      }
    }
  }, [projectViewTitle, showProjects, router, searchParams]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '1') {
        setTheme('grey');
        console.log('Switched to GREY theme');
      }
      if (e.ctrlKey && e.key === '2') {
        setTheme('dark');
        console.log('Switched to DARK theme');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const desktopRef = useRef<HTMLDivElement>(null);

  // Fetch projects for preview AND store all projects
  useEffect(() => {
    async function loadPreviews() {
      try {
        const allProjects = await getProjects();
        setProjects(allProjects);  // ADD THIS LINE
        
        if (allProjects.length > 0) {
          const shuffled = [...allProjects].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, Math.min(3, allProjects.length));
          setPreviewWindows(selected);
        }
      } catch (error) {
        console.error('Error loading preview projects:', error);
      }
    }
    loadPreviews();
  }, []);

  const handlePreviewClick = (projectId: string) => {
    setClosedPreviews(prev => new Set([...prev, projectId]));
    setSelectedProjectId(projectId);
    setShowProjects(true);
    setActiveWindow("projects");
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col" 
      style={{ 
        backgroundImage: 'url(/desktop.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#141414'
      }}
    >
      <TopBar />

      <div className="w-full h-px bg-white shrink-0" />

      <div ref={desktopRef} className="flex-1 relative overflow-hidden">
        <div className="absolute top-6.25 left-6.25 flex flex-col gap-8">
          <DesktopIcon 
            label="Projects" 
            icon="/projects.png" 
            onClick={() => {
              setShowProjects(true);
              setActiveWindow("projects");
            }} 
          />
          <DesktopIcon 
            label="Mail" 
            icon="/mail.png" 
            onClick={() => {
              setShowMail(true);
              setActiveWindow("mail");
            }} 
          />
          <DesktopIcon 
            label="QR Tool" 
            icon="/qr.png" 
            onClick={() => {
              setShowQR(true);
              setActiveWindow("qr");
            }} 
          />
        </div>

        {!isMobile && previewWindows.map((project, index) => {
          if (closedPreviews.has(project._id)) return null;
          
          const validImages = project.images?.filter(img => img && img.url) || [];
          if (validImages.length === 0) return null;
          
          const randomImage = validImages[Math.floor(Math.random() * validImages.length)];
          const offsetX = index * 60;
          const offsetY = index * 80;
          
          return (
            <PreviewWindow
              key={project._id}
              project={project}
              imageUrl={randomImage.url}
              offsetX={offsetX}
              offsetY={offsetY}
              isActive={activeWindow === `preview-${project._id}`}
              onActivate={() => setActiveWindow(`preview-${project._id}`)}
              onClose={() => setClosedPreviews(prev => new Set([...prev, project._id]))}
              onClick={() => handlePreviewClick(project._id)}
              desktopRef={desktopRef}
              theme={theme}
            />
          );
        })}

        {showProjects && (
          <Window 
            title={projectViewTitle ? `Project Browser - ${projectViewTitle}` : "Project Browser"}
            icon="/projects.png" 
            onClose={() => {
              setShowProjects(false);
              setSelectedProjectId(null);
              setProjectViewTitle(null);
              setViewingProject(null);
            }}
            isActive={activeWindow === "projects"}
            onClick={() => setActiveWindow("projects")}
            desktopRef={desktopRef}
            initialWidth={1350}
            initialHeight={675}
            statusText={projectsStatusText}
            theme={theme}
            showMaximize={true}
          >
            <FileBrowser 
              onStatusChange={setProjectsStatusText}
              initialProjectId={selectedProjectId}
              onProjectView={setProjectViewTitle}
              onCloseProject={() => {
                setViewingProject(null);
                setProjectViewTitle(null);
                setSelectedProjectId(null);
              }}
            />
          </Window>
        )}

        {showMail && (
          <Window 
            title="Mail" 
            icon="/mail.png" 
            onClose={() => setShowMail(false)}
            onMinimize={() => setIsMailMinimized(true)}
            isMinimized={isMailMinimized}
            isActive={activeWindow === "mail"}
            onClick={() => setActiveWindow("mail")}
            statusText={mailStatusText}
            desktopRef={desktopRef}
            theme={theme}
          >
            <div className="bg-white h-full w-full">
              <MailForm onStatusChange={setMailStatusText} />
            </div>
          </Window>
        )}

        {showQR && (
          <Window 
            title="QR Code Generator" 
            icon="/qr.png" 
            onClose={() => setShowQR(false)}
            onMinimize={() => setIsQRMinimized(true)}
            isMinimized={isQRMinimized}
            isActive={activeWindow === "qr"}
            onClick={() => setActiveWindow("qr")}
            statusText="Free QR code generator - No ads, no BS"
            desktopRef={desktopRef}
            initialWidth={500}
            initialHeight={550}
            theme={theme}
          >
            <QRGenerator />
          </Window>
        )}

        {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      </div>

      <TaskBar 
        onOpenAbout={() => setShowAbout(true)}
      />
    </div>
  );
}

function PreviewWindow({
  project,
  imageUrl,
  offsetX,
  offsetY,
  isActive,
  onActivate,
  onClose,
  onClick,
  desktopRef,
  theme
}: {
  project: Project;
  imageUrl: string;
  offsetX: number;
  offsetY: number;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onClick: () => void;
  desktopRef: React.RefObject<HTMLDivElement | null>;
  theme: 'grey' | 'dark';
}) {
  const [dimensions, setDimensions] = useState({ width: 350, height: 250 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrlRef = useRef(imageUrl);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      const maxWidth = 600;
      const maxHeight = 500;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      setDimensions({ width: Math.round(width), height: Math.round(height) });
      setImageLoaded(true);
    };
    img.src = imageUrlRef.current;
  }, []);

  if (!imageLoaded) return null;

  return (
    <Window
      title={project.title}
      icon="/icons/world-star.png"
      onClose={onClose}
      onMinimize={undefined}
      isActive={isActive}
      onClick={onActivate}
      statusText={project.shortDescription}
      desktopRef={desktopRef}
      initialWidth={dimensions.width}
      initialHeight={dimensions.height}
      initialX={200 + offsetX}
      initialY={150 + offsetY}
      theme={theme}
    >
      <div 
        className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
        onClick={onClick}
      >
        <img 
          src={imageUrlRef.current}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>
    </Window>
  );
}