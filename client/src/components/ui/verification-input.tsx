import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';

interface VerificationInputProps {
  length: number;
  onChange: (code: string) => void;
  autoFocus?: boolean;
}

export function VerificationInput({
  length = 6,
  onChange,
  autoFocus = true,
}: VerificationInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    
    // Auto focus first input when component mounts
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [length, autoFocus]);

  // Call onChange when code changes
  useEffect(() => {
    onChange(code.join(''));
  }, [code, onChange]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    // Only take the last character if multiple were pasted
    const singleValue = value.slice(-1);
    
    // Update code array
    const newCode = [...code];
    newCode[index] = singleValue;
    setCode(newCode);
    
    // Auto-advance to next field if a digit was entered
    if (singleValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index]) {
        // If current field is empty, focus previous field
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          
          const newCode = [...code];
          newCode[index - 1] = '';
          setCode(newCode);
        }
      } else {
        // Clear current field
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
    
    // Handle left arrow key
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow key
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent, startIndex: number) => {
    e.preventDefault();
    
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    
    if (!pastedData) return;
    
    const newCode = [...code];
    let cursorPosition = startIndex;
    
    // Fill inputs with pasted digits
    for (let i = 0; i < pastedData.length && startIndex + i < length; i++) {
      newCode[startIndex + i] = pastedData[i];
      cursorPosition = startIndex + i;
    }
    
    setCode(newCode);
    
    // Focus the field after the last pasted digit or the last field
    const focusIndex = Math.min(cursorPosition + 1, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={code[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          ref={(el) => (inputRefs.current[index] = el)}
          className="verification-input"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
