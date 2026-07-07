'use client';
// Core input and textarea components.

import { motion } from 'framer-motion';
import React, { forwardRef, memo, useCallback, useId, useRef } from 'react';
import { easeFast } from '../utils/animations';

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'placeholder'
> {
  label?: React.ReactNode;
  placeholder?: React.ReactNode;
  isInvalid?: boolean;
  errorMessage?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  fullWidth?: boolean;
  smoothTyping?: boolean;
}

export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        label,
        isInvalid,
        errorMessage,
        startContent,
        endContent,
        fullWidth = true,
        className = '',
        disabled,
        placeholder,
        value,
        id,
        smoothTyping,
        'aria-describedby': ariaDescribedBy,
        ...props
      },
      ref,
    ) => {
      const generatedId = useId();
      const inputId = id ?? `ism-input-${generatedId}`;
      const errorId = `${inputId}-error`;
      const describedBy =
        [ariaDescribedBy, isInvalid && errorMessage ? errorId : undefined]
          .filter(Boolean)
          .join(' ') || undefined;
      const localRef = useRef<HTMLInputElement>(null);
      const handleRef = useCallback(
        (node: HTMLInputElement) => {
          localRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement>).current = node;
          }
        },
        [ref],
      );

      const [localValue, setLocalValue] = React.useState(value);
      const [isFocused, setIsFocused] = React.useState(false);
      React.useEffect(() => {
        if (!isFocused) {
          setLocalValue(value);
        }
      }, [value, isFocused]);

      const displayValue = smoothTyping ? localValue : value;

      return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'w-auto'}`}>
          {label && (
            <label
              htmlFor={inputId}
              className={`text-[11px] font-bold uppercase tracking-widest pl-1 ${isInvalid ? 'text-danger' : 'text-text-secondary'}`}
            >
              {label}
            </label>
          )}

          <div className={`relative flex items-center w-full ${className}`}>
            {startContent && (
              <div className="absolute left-3 z-10 text-text-muted flex items-center justify-center">
                {startContent}
              </div>
            )}
            <input
              id={inputId}
              ref={handleRef}
              disabled={disabled}
              value={displayValue}
              aria-invalid={isInvalid || undefined}
              aria-describedby={describedBy}
              placeholder={typeof placeholder === 'string' ? placeholder : undefined}
              autoComplete={
                props.type === 'password' ? (props.autoComplete ?? 'off') : props.autoComplete
              }
              className={`
              w-full h-10 bg-bg-surface border rounded-md
              text-[13px] font-medium outline-none text-text-primary
              transition-colors shadow-inner placeholder:text-text-muted
              disabled:opacity-50 disabled:cursor-not-allowed
              ${startContent ? 'pl-9' : 'px-4'}
              ${endContent ? 'pr-9' : ''}
              ${isInvalid ? 'border-danger' : 'border-border-strong'}
            `}
              {...props}
              onFocus={(e) => {
                if (smoothTyping) setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                if (smoothTyping) setIsFocused(false);
                props.onBlur?.(e);
              }}
              onChange={(e) => {
                if (smoothTyping) setLocalValue(e.target.value);
                props.onChange?.(e);
              }}
            />
            {/* Position inner icons absolutely so they float perfectly over the input field */}
            {placeholder && typeof placeholder !== 'string' && (!value || value === '') && (
              <div
                className={`absolute left-0 right-0 z-0 pointer-events-none flex items-center h-full truncate text-[13px] text-text-muted ${startContent ? 'pl-9' : 'pl-4'} ${endContent ? 'pr-9' : 'pr-4'}`}
              >
                {placeholder}
              </div>
            )}
            {endContent && (
              <div className="absolute right-3 text-text-muted flex items-center justify-center">
                {endContent}
              </div>
            )}
          </div>

          {isInvalid && errorMessage && (
            <motion.span
              id={errorId}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={easeFast}
              className="text-[10px] font-medium pl-1 text-danger"
            >
              {errorMessage}
            </motion.span>
          )}
        </div>
      );
    },
  ),
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  smoothTyping?: boolean;
}

export const Textarea = memo(
  forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
      {
        label,
        isInvalid,
        errorMessage,
        fullWidth = true,
        className = '',
        disabled,
        id,
        smoothTyping,
        'aria-describedby': ariaDescribedBy,
        ...props
      },
      ref,
    ) => {
      const generatedId = useId();
      const textareaId = id ?? `ism-textarea-${generatedId}`;
      const errorId = `${textareaId}-error`;
      const describedBy =
        [ariaDescribedBy, isInvalid && errorMessage ? errorId : undefined]
          .filter(Boolean)
          .join(' ') || undefined;
      const localRef = useRef<HTMLTextAreaElement>(null);
      const handleRef = useCallback(
        (node: HTMLTextAreaElement) => {
          localRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLTextAreaElement>).current = node;
          }
        },
        [ref],
      );

      const [localValue, setLocalValue] = React.useState(props.value);
      const [isFocused, setIsFocused] = React.useState(false);
      React.useEffect(() => {
        if (!isFocused) {
          setLocalValue(props.value);
        }
      }, [props.value, isFocused]);

      const displayValue = smoothTyping ? localValue : props.value;

      const hasFlex1 = className.includes('flex-1');

      return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'w-auto'} ${hasFlex1 ? 'flex-1 h-full' : ''}`}>
          {label && (
            <label
              htmlFor={textareaId}
              className={`text-[11px] font-bold uppercase tracking-widest pl-1 ${isInvalid ? 'text-danger' : 'text-text-secondary'}`}
            >
              {label}
            </label>
          )}

          <div className={`relative flex w-full ${className} ${hasFlex1 ? 'h-full' : ''}`}>
            <textarea
              id={textareaId}
              ref={handleRef}
              disabled={disabled}
              aria-invalid={isInvalid || undefined}
              aria-describedby={describedBy}
              className={`
              w-full h-full min-h-20 bg-bg-surface border rounded-md
              text-[13px] font-medium outline-none text-text-primary
              transition-colors shadow-inner placeholder:text-text-muted p-3
              resize-none disabled:opacity-50 disabled:cursor-not-allowed
              ${isInvalid ? 'border-danger' : 'border-border-strong'}
            `}
              {...props}
              value={displayValue}
              onFocus={(e) => {
                if (smoothTyping) setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                if (smoothTyping) setIsFocused(false);
                props.onBlur?.(e);
              }}
              onChange={(e) => {
                if (smoothTyping) setLocalValue(e.target.value);
                props.onChange?.(e);
              }}
            />
          </div>

          {isInvalid && errorMessage && (
            <motion.span
              id={errorId}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={easeFast}
              className="text-[10px] font-medium pl-1 text-danger"
            >
              {errorMessage}
            </motion.span>
          )}
        </div>
      );
    },
  ),
);
Textarea.displayName = 'Textarea';
