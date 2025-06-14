type ButtonProp = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
};

function Button({ children, onClick }: ButtonProp) {
  return (
    <button
      className={
        "text-gray-900 bg-white border-2 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-lg px-2 py-1"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;