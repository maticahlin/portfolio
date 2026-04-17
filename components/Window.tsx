import React, { useState, useEffect, useRef } from 'react';

type WindowProps = {
    title: string;
    icon?: string;
    children: React.ReactNode;
    onClose?: () => void;
    onMinimize?: () => void;
    isMinimized?: boolean;
    isActive?: boolean;
    onClick?: () => void;
    statusText?: string;
    desktopRef: React.RefObject<HTMLDivElement | null>;
    initialWidth?: number;
    initialHeight?: number;
    initialX?: number;
    initialY?: number;
};

export default function Window({ 
    title, 
    icon, 
    children, 
    onClose, 
    onMinimize, 
    isMinimized, 
    isActive, 
    onClick, 
    statusText, 
    desktopRef,
    initialWidth = 600,
    initialHeight = 400
}: WindowProps) {
    const getRandomPosition = () => {
        if (!desktopRef.current) return { x: 100, y: 100 };
        
        const desktop = desktopRef.current.getBoundingClientRect();
        const windowWidth = initialWidth;
        const windowHeight = initialHeight;
        
        const maxX = Math.max(0, desktop.width - windowWidth - 20);
        const maxY = Math.max(0, desktop.height - windowHeight - 20);
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        return { x: randomX, y: randomY };
    };

    const [position, setPosition] = React.useState(getRandomPosition());
    const [size, setSize] = React.useState({ width: initialWidth, height: initialHeight });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const windowRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current && desktopRef.current && windowRef.current) {
                const desktop = desktopRef.current.getBoundingClientRect();
                const windowRect = windowRef.current.getBoundingClientRect();
                
                const newX = e.clientX - desktop.left - dragOffset.x;
                const newY = e.clientY - desktop.top - dragOffset.y;
                
                const clampedX = Math.max(0, Math.min(newX, desktop.width - windowRect.width));
                const clampedY = Math.max(0, Math.min(newY, desktop.height - windowRect.height));
                
                setPosition({
                    x: clampedX,
                    y: clampedY
                });
            }

            if (isResizingRef.current && desktopRef.current && windowRef.current) {
                const desktop = desktopRef.current.getBoundingClientRect();
                const windowRect = windowRef.current.getBoundingClientRect();
                
                const newWidth = e.clientX - windowRect.left;
                const newHeight = e.clientY - windowRect.top;
                
                const minWidth = 200;
                const minHeight = 150;
                
                setSize({
                    width: Math.max(minWidth, newWidth),
                    height: Math.max(minHeight, newHeight)
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            isDraggingRef.current = false;
            isResizingRef.current = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragOffset]);

    if (isMinimized) return null;

    return (
        <div 
            ref={windowRef} 
            className="absolute bg-grey-light shadow-lg flex flex-col" 
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: isActive ? 10 : 1,
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                borderRight: '2px solid black',
                borderBottom: '2px solid black',
                paddingTop: '2px',
                paddingLeft: '2px',
                paddingRight: '3px',
                paddingBottom: '2px'
            }}
            onClick={onClick}
        >
            {/* TITLE BAR */}
            <div 
                className="h-7 bg-accent px-1 flex items-center justify-between cursor-move select-none" 
                onMouseDown={(e) => {
                    e.preventDefault();
                    onClick?.();
                    if (desktopRef.current) {
                        const desktop = desktopRef.current.getBoundingClientRect();
                        setIsDragging(true);
                        isDraggingRef.current = true;
                        setDragOffset({
                            x: e.clientX - desktop.left - position.x,
                            y: e.clientY - desktop.top - position.y
                        });
                    }
                }}
            >
                <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                    {icon && <img src={icon} alt="" className="w-5 h-5 shrink-0" />}
                    <span className="text-white text-sm truncate">{title}</span>
                </div>

                <div className="flex gap-1 shrink-0">
                {/* Minimize - only show if onMinimize exists */}
                {onMinimize && (
                    <button onClick={onMinimize} className="w-6 h-5 bg-grey-mid border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] cursor-pointer hover:bg-grey-light transition-colors">
                    <span className="text-xs leading-none">_</span>
                    </button>
                )}
                
                {/* Close */}
                <button onClick={onClose} className="w-6 h-5 bg-grey-mid border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] cursor-pointer hover:bg-grey-light transition-colors">
                    <span className="text-xs leading-none">✕</span>
                </button>
                </div>
            </div>

            {/* DIVIDER + spacing */}
            <div className="h-0.5" />
            <div className="h-px bg-white" />
            <div className="h-px bg-grey-dark" />
            <div className="h-0.5" />

            {/* Content area */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>

            <div className="h-1" />
            {/* Status bar */}
            <div className="h-7 bg-grey-light border border-t-grey-dark border-l-grey-dark border-b-white border-r-white flex items-center px-1 gap-2 shrink-0">
                <span className="text-sm truncate overflow-hidden whitespace-nowrap flex-1">{statusText || "Ready"}</span>
                
                <div
                    className="cursor-nwse-resize shrink-0 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        isResizingRef.current = true;
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" className="opacity-50">
                        <line x1="14" y1="0" x2="0" y2="14" stroke="#808080" strokeWidth="1" />
                        <line x1="14" y1="5" x2="5" y2="14" stroke="#808080" strokeWidth="1" />
                        <line x1="14" y1="10" x2="10" y2="14" stroke="#808080" strokeWidth="1" />
                        <line x1="14" y1="14" x2="14" y2="14" stroke="#808080" strokeWidth="1" />
                    </svg>
                </div>
            </div>
        </div>
    );
}