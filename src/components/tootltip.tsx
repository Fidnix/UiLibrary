import React, { useState, useRef, useEffect, type ReactElement, cloneElement } from "react";

type Placement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
    content: React.ReactNode;
    children: ReactElement;
    placement?: Placement;
    delay?: number; // ms
    className?: string;
    maxWidth?: number | string;
}

export default function Tooltip({
    content,
    children,
    placement = "top",
    delay = 100,
    className,
    maxWidth = 240,
}: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLElement | null>(null);
    const tipRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<number | null>(null);
    const idRef = useRef<string>(`tooltip-${Math.random().toString(36).slice(2, 9)}`);

    useEffect(() => {
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!visible) return;

        const trigger = triggerRef.current;
        const tip = tipRef.current;
        if (!trigger || !tip) return;

        const tRect = trigger.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        const margin = 8;
        let top = 0;
        let left = 0;

        if (placement === "top") {
            top = tRect.top + scrollY - tipRect.height - margin;
            left = tRect.left + scrollX + (tRect.width - tipRect.width) / 2;
        } else if (placement === "bottom") {
            top = tRect.top + scrollY + tRect.height + margin;
            left = tRect.left + scrollX + (tRect.width - tipRect.width) / 2;
        } else if (placement === "left") {
            top = tRect.top + scrollY + (tRect.height - tipRect.height) / 2;
            left = tRect.left + scrollX - tipRect.width - margin;
        } else {
            // right
            top = tRect.top + scrollY + (tRect.height - tipRect.height) / 2;
            left = tRect.left + scrollX + tRect.width + margin;
        }

        // keep inside viewport
        const pad = 8;
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        left = Math.min(Math.max(left, pad + scrollX), vw - tipRect.width - pad + scrollX);
        top = Math.min(Math.max(top, pad + scrollY), vh - tipRect.height - pad + scrollY);

        setStyle({
            top: Math.round(top),
            left: Math.round(left),
        });
    }, [visible, placement, content, maxWidth]);

    const show = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setVisible(true), delay);
    };
    const hide = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        setVisible(false);
    };

    const child = cloneElement(children, {
        // @ts-ignore
        ref: (node: HTMLElement | null) => {
            // maintain existing ref if any
            const childRef = (children as any).ref;
            if (typeof childRef === "function") childRef(node);
            else if (childRef) childRef.current = node;
            triggerRef.current = node;
        },
        onMouseEnter: (e: React.MouseEvent) => {
            show();
            // @ts-ignore
            if (children.props.onMouseEnter) children.props.onMouseEnter(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            hide();
            // @ts-ignore
            if (children.props.onMouseLeave) children.props.onMouseLeave(e);
        },
        onFocus: (e: React.FocusEvent) => {
            show();
            // @ts-ignore
            if (children.props.onFocus) children.props.onFocus(e);
        },
        onBlur: (e: React.FocusEvent) => {
            hide();
            // @ts-ignore
            if (children.props.onBlur) children.props.onBlur(e);
        },
        "aria-describedby": visible ? idRef.current : undefined,
    });

    return (
        <>
            {child}
            {/*
                Portal is omitted for simplicity; tooltip is appended inline.
                Styling is minimal and self-contained.
            */}
            <div
                ref={tipRef}
                id={idRef.current}
                role="tooltip"
                aria-hidden={!visible}
                style={{
                    position: "absolute",
                    zIndex: 9999,
                    pointerEvents: "none",
                    transition: "opacity 120ms ease, transform 120ms ease",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(4px)",
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    padding: "6px 8px",
                    borderRadius: 4,
                    fontSize: 13,
                    lineHeight: "1",
                    maxWidth,
                    wordWrap: "break-word",
                    ...style,
                }}
                className={className}
            >
                <div style={{ position: "relative" }}>{content}</div>
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        width: 8,
                        height: 8,
                        background: "inherit",
                        transform: "rotate(45deg)",
                        // position arrow depending on placement
                        top: placement === "bottom" ? -4 : placement === "top" ? undefined : "50%",
                        bottom: placement === "top" ? -4 : undefined,
                        left: placement === "right" ? -4 : placement === "left" ? undefined : "50%",
                        right: placement === "left" ? -4 : undefined,
                        marginLeft: placement === "top" || placement === "bottom" ? -4 : undefined,
                        marginTop: placement === "left" || placement === "right" ? -4 : undefined,
                        boxShadow: "inherit",
                    }}
                />
            </div>
        </>
    );
}