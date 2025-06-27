import React from "react";

type TextAreaProps = {
  fieldName?: string;
  labelText?: string;
  rows?: number;
  value?: string;
  disabled?: boolean;
  hidden?: boolean;
};

export interface TextAreaHandle {
  getValue: () => string;
  clear: () => void;
}

const TextArea = React.forwardRef<TextAreaHandle, TextAreaProps>(
  ({ fieldName, labelText, rows, value, disabled, hidden }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => ({
      getValue: () => textareaRef.current?.value ?? "",
      clear: () => {
        if (textareaRef.current) {
          textareaRef.current.value = "";
        }
      },
    }));

    React.useLayoutEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.value = value ?? "";
      }
    }, [value]);

    return (
      <div className="flex flex-col" hidden={hidden}>
        <label hidden={hidden}>{labelText}</label>
        <textarea
          className="border-2 border-black px-2 py-1 rounded-sm"
          name={fieldName}
          ref={textareaRef}
          rows={rows}
          disabled={disabled}
          hidden={hidden}
        />
      </div>
    );
  }
);

export default TextArea;
