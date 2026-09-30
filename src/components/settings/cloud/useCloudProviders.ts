import { useEffect, useState } from "react";
import { commands, type CloudSttProvider } from "@/bindings";

let cache: CloudSttProvider[] | null = null;

export const useCloudProviders = (): CloudSttProvider[] => {
  const [providers, setProviders] = useState<CloudSttProvider[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    commands
      .getCloudSttProviders()
      .then((list) => {
        cache = list;
        setProviders(list);
      })
      .catch((e) => console.error("Failed to load cloud providers:", e));
  }, []);

  return providers;
};
