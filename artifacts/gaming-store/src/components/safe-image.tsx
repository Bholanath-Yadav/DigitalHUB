import { useEffect, useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
};

export default function SafeImage({ src, fallback = "/opengraph.jpg", alt, ...rest }: Props) {
  const [current, setCurrent] = useState<string | undefined | null>(src ?? fallback);

  useEffect(() => {
    setCurrent(src ?? fallback);
  }, [src, fallback]);

  function normalize(u?: string | null) {
    if (!u) return fallback;
    if (u.startsWith("http") || u.startsWith("/")) return u;
    try {
      return `${window.location.origin}/${u}`;
    } catch (e) {
      return u;
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={normalize(current)}
      alt={alt}
      onError={(e) => {
        const img = e.currentTarget;
        img.onerror = null;
        setCurrent(fallback);
      }}
      {...rest}
    />
  );
}
