import { useEffect } from "react";

export function JsonLd({ id, data }: { id: string; data: unknown }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.querySelector(`#${id}`)?.remove();
    document.head.appendChild(script);
    return () => script.remove();
  }, [id, data]);

  return null;
}
