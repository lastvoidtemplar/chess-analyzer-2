import React from "react";

type InputProps = {
  fieldName?: string;
  labelText?: string;
  inputType: React.HTMLInputTypeAttribute;
  value?: string;
  disabled?: boolean;
  hidden?: boolean;
};

export interface InputHandle {
  getValue: () => string;
  clear: () => void;
}

const Input = React.forwardRef<InputHandle, InputProps>(
  ({ fieldName, labelText, inputType, value, disabled, hidden }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => ({
      getValue: () => inputRef.current?.value ?? "",
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
    }));

    React.useLayoutEffect(() => {
      if (inputRef.current) {
        inputRef.current.value = value ?? "";
      }
    }, [value]);

    return (
      <div className="flex flex-col" hidden={hidden}>
        <label hidden={hidden}>{labelText}</label>
        <input
          className="border-2 border-black px-2 py-1 rounded-sm"
          type={inputType}
          name={fieldName}
          ref={inputRef}
          disabled={disabled}
          hidden={hidden}
        />
      </div>
    );
  }
);

export default Input;
