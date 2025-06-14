import React from "react";

type FormProps = {
  className?: string;
  onSubmit?: (e: React.FormEvent)=>void
  children: React.ReactNode;
};

export type FormHandle = {
  getValue: () => unknown;
};

const Form = React.forwardRef<FormHandle, FormProps>(
  ({ className,onSubmit, children }, ref) => {
    const formRef = React.useRef<HTMLFormElement>(null);

    React.useImperativeHandle(ref, () => ({
      getValue: () => {
        if (formRef.current) {
          const formData = new FormData(formRef.current);
          const data = Object.fromEntries(formData.entries());
          return data
        }
      },
    }));

    return (
      <form className={className} ref={formRef} onSubmit={onSubmit}>
        {children}
      </form>
    );
  }
);

export default Form
