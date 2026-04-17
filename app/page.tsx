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

import { useState, useRef, useEffect } from 'react';

export default function Home() {
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

  const desktopRef = useRef<HTMLDivElement>(null);

  // Fetch 3 random projects for preview on mount
  useEffect(() => {
    async function loadPreviews() {
      try {
        const allProjects = await getProjects();
        if (allProjects.length > 0) {
          // Shuffle and take 3
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
    // Open Projects window with this project selected
    setSelectedProjectId(projectId);
    setShowProjects(true);
    setActiveWindow("projects");
  };

  const openWindows = [];
  if (showProjects) {
    openWindows.push({
      title: "File Browser (Projects)",
      icon: "/projects.png",
      isMinimized: isProjectsMinimized,
      isActive: activeWindow === "projects",
      onRestore: () => {
        setIsProjectsMinimized(false);
        setActiveWindow("projects");
      }
    });
  }
  if (showMail) {
    openWindows.push({
      title: "Mail",
      icon: "/mail.png",
      isMinimized: isMailMinimized,
      isActive: activeWindow === "mail",
      onRestore: () => {
        setIsMailMinimized(false);
        setActiveWindow("mail");
      }
    });
  }
  if (showQR) {
    openWindows.push({
      title: "QR Code Generator",
      icon: "/qr.png",
      isMinimized: isQRMinimized,
      isActive: activeWindow === "qr",
      onRestore: () => {
        setIsQRMinimized(false);
        setActiveWindow("qr");
      }
    });
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ backgroundImage: 'url(/desktop.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <TopBar />

      {/* White separator line */}
      <div className="w-full h-px bg-white shrink-0" />

      {/* Desktop */}
      <div ref={desktopRef} className="flex-1 relative overflow-hidden">
      {/* OLD: className="flex-1 relative overflow-hidden bg-desktop-dark" */}
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

        {/* Preview Windows - From Sanity */}
        {previewWindows.map((project, index) => {
          if (closedPreviews.has(project._id)) return null;
          
          // Get valid images
          const validImages = project.images?.filter(img => img && img.url) || [];
          if (validImages.length === 0) return null;
          
          // Pick RANDOM image from project
          const randomImage = validImages[Math.floor(Math.random() * validImages.length)];
          
          // Stagger positions
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
            />
          );
        })}

        {/* Projects Window */}
        {showProjects && (
          <Window 
            title="File Browser (Projects)" 
            icon="/projects.png" 
            onClose={() => {
              setShowProjects(false);
              setSelectedProjectId(null);
            }}
            onMinimize={() => setIsProjectsMinimized(true)}
            isMinimized={isProjectsMinimized}
            isActive={activeWindow === "projects"}
            onClick={() => setActiveWindow("projects")}
            desktopRef={desktopRef}
            initialWidth={1350}
            initialHeight={600}
            statusText={projectsStatusText}
          >
            <FileBrowser 
              onStatusChange={setProjectsStatusText}
              initialProjectId={selectedProjectId}
            />
          </Window>
        )}

        {/* Mail Window */}
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
          >
            <div className="bg-white h-full w-full">
              <MailForm onStatusChange={setMailStatusText} />
            </div>
          </Window>
        )}

        {/* QR Generator Window */}
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
          >
            <QRGenerator />
          </Window>
        )}

        {/* About Dialog */}
        {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      </div>

      <TaskBar 
        openWindows={openWindows}
        onOpenAbout={() => setShowAbout(true)}
      />
    </div>
  );
}

// Preview Window Component that adapts to image size
function PreviewWindow({
  project,
  imageUrl,
  offsetX,
  offsetY,
  isActive,
  onActivate,
  onClose,
  onClick,
  desktopRef
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
}) {
  const [dimensions, setDimensions] = useState({ width: 350, height: 250 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrlRef = useRef(imageUrl); // Store the initial image URL

  useEffect(() => {
    // Use the ref value, not the prop (which might change)
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
  }, []); // Empty deps - only run once

  if (!imageLoaded) return null;

  return (
    <Window
      title={project.title}
      icon="/projects.png"
      onClose={onClose}
      isActive={isActive}
      onClick={onActivate}
      statusText={project.shortDescription}
      desktopRef={desktopRef}
      initialWidth={dimensions.width}
      initialHeight={dimensions.height}
      initialX={200 + offsetX}
      initialY={150 + offsetY}
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