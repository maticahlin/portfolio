import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { t, border, anim } from '@/lib/theme';

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
    showMaximize?: boolean;
    ghost?: boolean;
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
    showMaximize = false,
    ghost = false,
}: WindowProps) {
    const getRandomPosition = () => {
        if (!desktopRef.current) return { x: 100, y: 100 };
        const desktop = desktopRef.current.getBoundingClientRect();
        const maxX = Math.max(0, desktop.width  - initialWidth  - 20);
        const maxY = Math.max(0, desktop.height - initialHeight - 20);
        return {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY),
        };
    };

    const [position, setPosition]     = React.useState(getRandomPosition());
    const [size, setSize]             = React.useState({ width: initialWidth, height: initialHeight });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [isMaximized, setIsMaximized] = React.useState(false);
    const [prevState, setPrevState]   = React.useState({ position: { x: 0, y: 0 }, size: { width: 0, height: 0 } });
    const [pressedButton, setPressedButton] = useState<'maximize' | 'close' | null>(null);
    const [isMobile, setIsMobile]     = useState(false);
    const [isHovered, setIsHovered]   = useState(false);

    const isDraggingRef = useRef(false);
    const isResizingRef = useRef(false);
    const windowRef     = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const handleMaximize = () => {
        if (!desktopRef.current) return;
        if (!isMaximized) {
            setPrevState({ position: { ...position }, size: { ...size } });
            const desktop = desktopRef.current.getBoundingClientRect();
            setPosition({ x: 0, y: 0 });
            setSize({ width: desktop.width, height: desktop.height });
            setIsMaximized(true);
        } else {
            setPosition(prevState.position);
            setSize(prevState.size);
            setIsMaximized(false);
        }
    };

    const getButtonStyle = (name: 'maximize' | 'close') => {
        const pressed = pressedButton === name;
        return pressed
            ? { ...border.button.pressed, backgroundColor: t.bgInner, color: t.text }
            : { ...border.button.raised,  backgroundColor: t.bgInner, color: t.text };
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current && desktopRef.current && windowRef.current && !isMaximized) {
                const desktop    = desktopRef.current.getBoundingClientRect();
                const windowRect = windowRef.current.getBoundingClientRect();
                const newX = e.clientX - desktop.left - dragOffset.x;
                const newY = e.clientY - desktop.top  - dragOffset.y;
                setPosition({
                    x: Math.max(0, Math.min(newX, desktop.width  - windowRect.width)),
                    y: Math.max(0, Math.min(newY, desktop.height - windowRect.height)),
                });
            }
            if (isResizingRef.current && desktopRef.current && windowRef.current && !isMaximized) {
                const windowRect = windowRef.current.getBoundingClientRect();
                setSize({
                    width:  Math.max(200, e.clientX - windowRect.left),
                    height: Math.max(150, e.clientY - windowRect.top),
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            isDraggingRef.current = false;
            isResizingRef.current = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup',   handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup',   handleMouseUp);
        };
    }, [dragOffset, isMaximized]);

    if (isMinimized) return null;

    // ─── Ghost window — completely separate render path ───────────────────────
    if (ghost) {
        return (
            <motion.div
                ref={windowRef}
                className="absolute"
                {...anim.window}
                style={{
                    left: `${position.x}px`,
                    top:  `${position.y}px`,
                    width:  `${size.width}px`,
                    height: `${size.height}px`,
                    zIndex: isActive ? 10 : 1,
                    border: `1px solid ${isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                    overflow: 'hidden',
                }}
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Content fills entire window */}
                <div className="absolute inset-0 overflow-hidden">
                    {children}
                </div>

                {/* Title bar overlaid on top */}
                <div
                    className="absolute left-0 right-0 top-0 h-7 px-2 flex items-center justify-between select-none cursor-move"
                    style={{
                        zIndex: 2,
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        color: t.text,
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onClick?.();
                        if (desktopRef.current) {
                            const desktop = desktopRef.current.getBoundingClientRect();
                            setIsDragging(true);
                            isDraggingRef.current = true;
                            setDragOffset({
                                x: e.clientX - desktop.left - position.x,
                                y: e.clientY - desktop.top  - position.y,
                            });
                        }
                    }}
                >
                    <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                        {icon && <img src={icon} alt="" className="w-5 h-5 shrink-0" />}
                        <span className="text-sm truncate" style={{ color: t.text }}>{title}</span>
                    </div>
                    <button
                        onMouseDown={(e) => { e.stopPropagation(); setPressedButton('close'); }}
                        onMouseUp={() => { setPressedButton(null); onClose?.(); }}
                        onMouseLeave={() => setPressedButton(null)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-5 border flex items-center justify-center cursor-pointer"
                        style={getButtonStyle('close')}
                    >
                        <span className="text-xs leading-none">✕</span>
                    </button>
                </div>

                {/* Status bar overlaid on bottom */}
                <div
                    className="absolute left-0 right-0 bottom-0 h-7 px-2 flex items-center"
                    style={{
                        zIndex: 2,
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        color: t.text,
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                    }}
                >
                    <span className="text-sm truncate">{statusText || 'Ready'}</span>
                </div>
            </motion.div>
        );
    }

    // ─── Regular window ───────────────────────────────────────────────────────
    const outerStyle = isMobile ? {
        width: '100%', height: '100%',
        zIndex: isActive ? 10 : 1,
        backgroundColor: t.bgWindow,
        ...border.window,
        paddingTop: '1px', paddingLeft: '1px', paddingRight: '1px', paddingBottom: '1px',
        boxShadow: isActive
            ? '0 16px 48px rgba(0,0,0,0.9)'
            : '0 4px 16px rgba(0,0,0,0.5)',
    } : {
        left: `${position.x}px`, top: `${position.y}px`,
        width: `${size.width}px`, height: `${size.height}px`,
        zIndex: isActive ? 10 : 1,
        backgroundColor: t.bgWindow,
        ...border.window,
        paddingTop: '1px', paddingLeft: '1px', paddingRight: '1px', paddingBottom: '1px',
        boxShadow: isActive
            ? '0 16px 48px rgba(0,0,0,0.9)'
            : '0 4px 16px rgba(0,0,0,0.5)',
    };

    return (
        <motion.div
            ref={windowRef}
            className={`${isMobile ? 'absolute inset-0' : 'absolute'} flex flex-col`}
            {...anim.window}
            style={outerStyle}
            onClick={onClick}
        >
            {/* TITLE BAR */}
            <div
                className={`h-7 px-1 flex items-center justify-between select-none ${!isMaximized && !isMobile ? 'cursor-move' : ''}`}
                style={{
                    backgroundColor: isActive ? '#5a5a5a' : t.bgInner,
                    color: t.text,
                    opacity: isActive ? 1 : 0.5,
                }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    onClick?.();
                    if (desktopRef.current && !isMaximized && !isMobile) {
                        const desktop = desktopRef.current.getBoundingClientRect();
                        setIsDragging(true);
                        isDraggingRef.current = true;
                        setDragOffset({
                            x: e.clientX - desktop.left - position.x,
                            y: e.clientY - desktop.top  - position.y,
                        });
                    }
                }}
            >
                <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                    {icon && <img src={icon} alt="" className="w-5 h-5 shrink-0" />}
                    <span className="text-sm truncate" style={{ color: t.text }}>{title}</span>
                </div>

                <div className="flex gap-1 shrink-0">
                    {showMaximize && !isMobile && (
                        <button
                            onMouseDown={(e) => { e.stopPropagation(); setPressedButton('maximize'); }}
                            onMouseUp={() => { setPressedButton(null); handleMaximize(); }}
                            onMouseLeave={() => setPressedButton(null)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-5 border flex items-center justify-center cursor-pointer"
                            style={getButtonStyle('maximize')}
                            title={isMaximized ? 'Restore' : 'Maximize'}
                        >
                            <span className="text-xs leading-none">{isMaximized ? '❐' : '□'}</span>
                        </button>
                    )}
                    <button
                        onMouseDown={(e) => { e.stopPropagation(); setPressedButton('close'); }}
                        onMouseUp={() => { setPressedButton(null); onClose?.(); }}
                        onMouseLeave={() => setPressedButton(null)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-5 border flex items-center justify-center cursor-pointer"
                        style={getButtonStyle('close')}
                    >
                        <span className="text-xs leading-none">✕</span>
                    </button>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="h-0.5" />
            <div className="h-px" style={{ backgroundColor: t.borderLight }} />
            <div className="h-px" style={{ backgroundColor: t.borderDark }} />
            <div className="h-0.5" />

            {/* Content */}
            <div className="flex-1 overflow-auto" style={{ padding: '2px' }}>
                {children}
            </div>

            <div className="h-1" />

            {/* Status Bar */}
            <div
                className="h-7 border flex items-center px-1 gap-2 shrink-0"
                style={{ backgroundColor: t.bgInner, color: t.text, ...border.inset }}
            >
                <span className="text-sm truncate overflow-hidden whitespace-nowrap flex-1">
                    {statusText || 'Ready'}
                </span>

                {!isMaximized && !isMobile && (
                    <div
                        className="cursor-nwse-resize shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            isResizingRef.current = true;
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14">
                            <line x1="14" y1="0"  x2="0"  y2="14" stroke={t.text} strokeWidth="1" />
                            <line x1="14" y1="5"  x2="5"  y2="14" stroke={t.text} strokeWidth="1" />
                            <line x1="14" y1="10" x2="10" y2="14" stroke={t.text} strokeWidth="1" />
                        </svg>
                    </div>
                )}
            </div>
        </motion.div>
    );
}