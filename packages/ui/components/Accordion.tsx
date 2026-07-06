'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Divider } from '../layout/Layout';
import React, { useState } from 'react';
import { useIsmConfig } from '../providers/IsmProvider';
import { easeSmooth, reducedMotionTransition } from '../utils/animations';

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  defaultExpandedKeys?: string[];
  expandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  selectionMode?: 'single' | 'multiple';
  autoScroll?: boolean;
}

export const Accordion: React.FC<AccordionProps> = React.memo(
  ({
    children,
    className = '',
    defaultExpandedKeys = [],
    expandedKeys,
    onExpandedChange,
    selectionMode = 'single',
    autoScroll,
  }) => {
    // Support both controlled and uncontrolled states seamlessly so consumers don't have to manage state if they don't want to.
    const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(
      new Set(defaultExpandedKeys),
    );
    const currentExpandedKeys = expandedKeys ? new Set(expandedKeys) : internalExpandedKeys;

    const toggleKey = (key: string) => {
      const next = new Set(currentExpandedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (selectionMode === 'single') next.clear();
        next.add(key);
      }
      if (expandedKeys) {
        onExpandedChange?.([...next]);
        return;
      }
      setInternalExpandedKeys(next);
      onExpandedChange?.([...next]);
    };

    return (
      <div className={`flex flex-col w-full gap-2 ${className}`}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement<AccordionItemProps>(child)) {
            const key = child.props.value || child.key?.toString() || `accordion-item-${index}`;
            return React.cloneElement(child, {
              ...child.props,
              isOpen: currentExpandedKeys.has(key),
              onToggle: () => toggleKey(key),
              autoScroll:
                child.props.autoScroll !== undefined ? child.props.autoScroll : autoScroll,
            });
          }
          return child;
        })}
      </div>
    );
  },
);

export interface AccordionItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  startContent?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  key?: string;
  autoScroll?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = React.memo(
  ({
    title,
    subtitle,
    children,
    isOpen = false,
    onToggle,
    startContent,
    className = '',
    autoScroll,
  }) => {
    const itemRef = React.useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldReduceMotion = useReducedMotion();
    const reactId = React.useId();
    const triggerId = `ism-accordion-trigger-${reactId}`;
    const panelId = `ism-accordion-panel-${reactId}`;
    const { autoScrollAccordions } = useIsmConfig();
    const shouldAutoScroll = autoScroll !== undefined ? autoScroll : (autoScrollAccordions !== false);
    const transition = shouldReduceMotion ? reducedMotionTransition : easeSmooth;

    React.useEffect(
      () => () => {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      },
      [],
    );

    const handleToggle = () => {
      onToggle?.();
      const willBeOpen = !isOpen;

      if (willBeOpen && shouldAutoScroll && typeof window !== 'undefined') {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        // Delay the auto-scroll just enough to let the accordion opening animation play out
        scrollTimeoutRef.current = setTimeout(() => {
          if (itemRef.current) {
            window.dispatchEvent(
              new CustomEvent('lenis-scroll', { detail: { target: itemRef.current, offset: -24 } }),
            );
          }
        }, 340);
      }
    };

    return (
      <div
        ref={itemRef}
        className={[
          'flex flex-col overflow-hidden scroll-my-24',
          'rounded-lg border transition-all duration-200',
          isOpen
            ? 'bg-bg-surface border-border-strong shadow-subtle'
            : 'bg-bg-surface border-border-subtle hover:border-border-strong',
          className,
        ].join(' ')}
      >
        <button
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={handleToggle}
          className="flex items-center justify-between w-full px-5 py-4 text-left cursor-pointer select-none outline-none group"
          style={{ transform: 'none' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {startContent && <div className="shrink-0 text-text-muted">{startContent}</div>}
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-text-primary truncate tracking-tight">
                {title}
              </span>
              {subtitle && (
                <span className="text-xs text-text-muted truncate mt-0.5">{subtitle}</span>
              )}
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={transition}
            className="shrink-0 ml-3"
          >
            <ChevronDown
              size={16}
              className="text-text-muted group-hover:text-text-secondary transition-colors"
            />
          </motion.div>
        </button>

        <motion.div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          aria-hidden={!isOpen}
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={transition}
          className="overflow-hidden"
        >
          <Divider className="my-0 border-0! bg-linear-to-r from-transparent via-border-subtle to-transparent h-px opacity-75" />
          <div className="flex flex-col px-5 pb-5 pt-0 text-sm text-text-secondary">
            <div className="pt-4 flex flex-col">{children}</div>
          </div>
        </motion.div>
      </div>
    );
  },
);
