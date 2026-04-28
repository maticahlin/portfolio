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
    theme?: 'grey' | 'dark';
    showMaximize?: boolean;
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
    initialHeight = 400,
    theme = 'grey',
    showMaximize = false   
}: WindowProps) {
    const bgColor = theme === 'dark' ? '#474747' : '#e6e6e6';
    const innerBg = theme === 'dark' ? '#323232' : '#ffffff';
    const titleBg = theme === 'dark' ? '#323232' : '#4047c9';
    const buttonBg = theme === 'dark' ? '#323232' : '#cccccc';
    const buttonHoverBg = theme === 'dark' ? '#474747' : '#ffffff';
    const textColor = theme === 'dark' ? '#E2E2E2' : '#000000';
    const borderLight = theme === 'dark' ? '#9F9F9F' : 'white';
    const borderDark = theme === 'dark' ? '#000000' : '#a6a6a6';

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
    const [isMaximized, setIsMaximized] = React.useState(false);
    const [prevState, setPrevState] = React.useState({ 
        position: { x: 0, y: 0 }, 
        size: { width: 0, height: 0 } 
    });
    
    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const windowRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMaximize = () => {
        if (!desktopRef.current) return;

        if (!isMaximized) {
            setPrevState({
                position: { ...position },
                size: { ...size }
            });

            const desktop = desktopRef.current.getBoundingClientRect();
            setPosition({ x: 0, y: 0 });
            setSize({ 
                width: desktop.width, 
                height: desktop.height 
            });
            setIsMaximized(true);
        } else {
            setPosition(prevState.position);
            setSize(prevState.size);
            setIsMaximized(false);
        }
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current && desktopRef.current && windowRef.current && !isMaximized) {
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

            if (isResizingRef.current && desktopRef.current && windowRef.current && !isMaximized) {
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
    }, [dragOffset, isMaximized]);

    if (isMinimized) return null;

    return (
        <div 
            ref={windowRef} 
            className={`${isMobile ? 'absolute inset-0' : 'absolute'} shadow-lg flex flex-col`}
            style={isMobile ? {
                width: '100%',
                height: '100%',
                zIndex: isActive ? 10 : 1,
                backgroundColor: bgColor,
                borderTop: `2px solid ${borderLight}`,
                borderLeft: `2px solid ${borderLight}`,
                borderRight: `2px solid ${borderDark}`,
                borderBottom: `2px solid ${borderDark}`,
                paddingTop: '1px',
                paddingLeft: '1px',
                paddingRight: '2px',
                paddingBottom: '2px'
            } : { 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: isActive ? 10 : 1,
                backgroundColor: bgColor,
                borderTop: `2px solid ${borderLight}`,
                borderLeft: `2px solid ${borderLight}`,
                borderRight: `2px solid ${borderDark}`,
                borderBottom: `2px solid ${borderDark}`,
                paddingTop: '1px',
                paddingLeft: '1px',
                paddingRight: '2px',
                paddingBottom: '2px'
            }}
            onClick={onClick}
        >
            {/* TITLE BAR */}
            <div 
                className={`h-7 px-1 flex items-center justify-between select-none ${!isMaximized && !isMobile ? 'cursor-move' : ''}`}
                style={{ backgroundColor: titleBg, color: textColor }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    onClick?.();
                    if (desktopRef.current && !isMaximized && !isMobile) {
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
                    <span className="text-sm truncate" style={{ color: textColor }}>{title}</span>
                </div>

                <div className="flex gap-1 shrink-0">
                    {/* Maximize */}
                    {showMaximize && !isMobile && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMaximize();
                            }}
                            className="w-6 h-5 border flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
                            style={{ 
                                backgroundColor: buttonBg,
                                borderTopColor: borderLight,
                                borderLeftColor: borderLight,
                                borderRightColor: borderDark,
                                borderBottomColor: borderDark,
                                color: textColor,
                                boxShadow: theme === 'dark' 
                                    ? `inset 1px 1px 0 0 ${borderLight}, inset -1px -1px 0 0 ${borderDark}`
                                    : 'inset 1px 1px 0 0 #dfdfdf, inset -1px -1px 0 0 #808080'
                            }}
                            title={isMaximized ? "Restore" : "Maximize"}
                        >
                            <span className="text-xs leading-none">{isMaximized ? '❐' : '□'}</span>
                        </button>
                    )}
                    
                    {/* Close */}
                    <button 
                        onClick={onClose} 
                        className="w-6 h-5 border flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
                        style={{ 
                            backgroundColor: buttonBg,
                            borderTopColor: borderLight,
                            borderLeftColor: borderLight,
                            borderRightColor: borderDark,
                            borderBottomColor: borderDark,
                            color: textColor,
                            boxShadow: theme === 'dark' 
                                ? `inset 1px 1px 0 0 ${borderLight}, inset -1px -1px 0 0 ${borderDark}`
                                : 'inset 1px 1px 0 0 #dfdfdf, inset -1px -1px 0 0 #808080'
                        }}
                    >
                        <span className="text-xs leading-none">✕</span>
                    </button>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="h-0.5" />
            <div className="h-px" style={{ backgroundColor: borderLight }} />
            <div className="h-px" style={{ backgroundColor: borderDark }} />
            <div className="h-0.5" />

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>

            <div className="h-1" />
            
            {/* Status Bar */}
            <div 
                className="h-7 border flex items-center px-1 gap-2 shrink-0"
                style={{ 
                    backgroundColor: innerBg,
                    borderTopColor: borderDark,
                    borderLeftColor: borderDark,
                    borderBottomColor: borderLight,
                    borderRightColor: borderLight,
                    color: textColor
                }}
            >
                <span className="text-sm truncate overflow-hidden whitespace-nowrap flex-1">{statusText || "Ready"}</span>
                
                {/* Resize handle */}
                {!isMaximized && !isMobile && (
                    <div
                        className="cursor-nwse-resize shrink-0 hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            isResizingRef.current = true;
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" className="opacity-50">
                            <line x1="14" y1="0" x2="0" y2="14" stroke={textColor} strokeWidth="1" />
                            <line x1="14" y1="5" x2="5" y2="14" stroke={textColor} strokeWidth="1" />
                            <line x1="14" y1="10" x2="10" y2="14" stroke={textColor} strokeWidth="1" />
                            <line x1="14" y1="14" x2="14" y2="14" stroke={textColor} strokeWidth="1" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}