'use client';
// Form layout wrappers for our core primitives.
// They handle labels, alignment, and spacing so you don't have to write the same flexbox boilerplate 100 times.

import React from 'react';
import { Button as BaseButton, ButtonProps } from '../components/Button';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { Input as BaseInput, Textarea as BaseTextarea } from '../components/Input';
import { Switch } from '../components/Switch';

// Standard row layout for a toggle switch with an optional description block.
export const FormToggle: React.FC<{
  label: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  fullWidth?: boolean;
  className?: string;
}> = ({ label, description, checked, onChange, fullWidth = true, className = '' }) => (
  <div className={`${fullWidth ? 'w-full' : 'w-fit'} ${className}`}>
    <Switch
      label={label}
      description={description}
      isSelected={checked}
      onValueChange={onChange}
      fullWidth={fullWidth}
    />
  </div>
);

export const FormDropdown: React.FC<{
  label?: React.ReactNode;
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  width?: string;
  className?: string;
  disabled?: boolean;
}> = ({
  label,
  options,
  value,
  onChange,
  width = 'w-[140px]',
  className = '',
  disabled = false,
}) => (
  <div className={`flex items-center justify-between w-full ${className}`}>
    {label && <span className="text-sm font-medium text-text-primary mr-4">{label}</span>}
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      width={width}
      disabled={disabled}
    />
  </div>
);

// Standard input layout with a left-aligned label.
export const FormInput: React.FC<any> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  width = 'w-full',
  className = '',
  smoothTyping = true,
  ...props
}) => {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={`flex items-center justify-between w-full gap-4 ${className}`}>
      {label && <span className="text-sm font-medium text-text-primary shrink-0">{label}</span>}
      <div className={width}>
        <BaseInput
          type={type}
          value={value}
          onChange={(e: any) => {
            const val = e.target.value;
            if (smoothTyping) {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => onChange(val), 200);
            } else {
              onChange(val);
            }
          }}
          placeholder={placeholder}
          fullWidth
          smoothTyping={smoothTyping}
          {...props}
        />
      </div>
    </div>
  );
};

export const FormTextarea: React.FC<any> = ({
  label,
  value,
  onChange,
  placeholder,
  className = '',
  textareaRef,
  smoothTyping = true,
  ...props
}) => {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Determine if we should pass flex-1 down
  const hasFlex1 = className.includes('flex-1');

  return (
    <div className={`flex flex-col w-full gap-2 ${className}`}>
      {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
      <BaseTextarea
        value={value}
        onChange={(e: any) => {
          const val = e.target.value;
          if (smoothTyping) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => onChange(val), 200);
          } else {
            onChange(val);
          }
        }}
        placeholder={placeholder}
        fullWidth
        ref={textareaRef}
        smoothTyping={smoothTyping}
        className={hasFlex1 ? 'flex-1' : ''}
        {...props}
      />
    </div>
  );
};

export const FormButton: React.FC<ButtonProps & { label?: React.ReactNode }> = ({
  label,
  children,
  ...props
}) => (
  <div className={props.className?.includes('flex-1') ? 'flex-1' : ''}>
    <BaseButton {...props} className={`w-full ${props.className || ''}`}>
      {label || children}
    </BaseButton>
  </div>
);

export const FormColorPickerRow: React.FC<{
  label: React.ReactNode;
  color: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ label, color, onClick, className = '' }) => (
  <div className={`flex items-center justify-between w-full ${className}`}>
    <span className="text-sm font-medium text-text-primary">{label}</span>
    <button
      type="button"
      className="w-8 h-8 rounded-full border-2 border-border-strong hover:scale-105 transition-transform shadow-sm overflow-hidden relative"
      onClick={onClick}
      aria-label="Pick Color"
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQEhD/o8F8Gk48HMgE4iNYXg1jJpgNMGgZ8DQC8OoaRg0DMxMAADkZgq27C1j/wAAAABJRU5ErkJggg==")',
        }}
      >
        <div className="w-full h-full" style={{ backgroundColor: color }} />
      </div>
    </button>
  </div>
);
