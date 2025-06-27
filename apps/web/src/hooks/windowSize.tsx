import React from "react";

type UseWindowSizeResult = {
  width: number;
  height: number;
};

function useWindowSize(): UseWindowSizeResult {
  const [width, setWidth] = React.useState(() => document.documentElement.clientWidth);
  const [height, setHeight] = React.useState(() => document.documentElement.clientHeight);

  React.useLayoutEffect(() => {
    function handleWindowSizeChange() {
      setWidth(() => document.documentElement.clientWidth);
      setHeight(() => document.documentElement.clientHeight);
    }
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return { width, height };
}

export default useWindowSize;