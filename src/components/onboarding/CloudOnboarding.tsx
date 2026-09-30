import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { commands } from "@/bindings";
import { Dropdown } from "@/components/ui";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import HandyTextLogo from "../icons/HandyTextLogo";
import { useCloudProviders } from "../settings/cloud/useCloudProviders";

interface CloudOnboardingProps {
  onDone: () => void;
  onUseLocal: () => void;
}

const CloudOnboarding: React.FC<CloudOnboardingProps> = ({
  onDone,
  onUseLocal,
}) => {
  const { t } = useTranslation();
  const providers = useCloudProviders();
  const [providerId, setProviderId] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const provider = providers.find((p) => p.id === providerId);

  const handleContinue = async () => {
    if (!apiKey.trim()) {
      toast.error(t("onboarding.cloud.keyRequired"));
      return;
    }
    setBusy(true);
    try {
      await commands.setCloudSttProvider(providerId);
      await commands.changeCloudSttApiKeySetting(providerId, apiKey.trim());
      await commands.changeCloudSttEnabledSetting(true);
      const test = await commands.testCloudStt();
      if (test.status === "error") {
        toast.error(t("settings.cloud.test.failed", { error: test.error }));
        return;
      }
      await commands.completeCloudOnboarding();
      toast.success(t("settings.cloud.test.ok"));
      onDone();
    } finally {
      setBusy(false);
    }
  };

  const handleLocal = async () => {
    await commands.changeCloudSttEnabledSetting(false);
    onUseLocal();
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 gap-6">
      <div className="flex flex-col items-center gap-2">
        <HandyTextLogo width={220} />
        <p className="text-text/70 max-w-md text-center">
          {t("onboarding.cloud.subtitle")}
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4 rounded-xl border border-mid-gray/20 p-5 bg-mid-gray/5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            {t("onboarding.cloud.provider")}
          </span>
          <Dropdown
            options={providers
              .filter((p) => p.id !== "custom")
              .map((p) => ({
                value: p.id,
                label:
                  p.id === "gemini"
                    ? `${p.label} — ${t("onboarding.cloud.recommended")}`
                    : p.label,
              }))}
            selectedValue={providerId}
            onSelect={setProviderId}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            {t("onboarding.cloud.apiKey")}
          </span>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t("settings.cloud.apiKey.placeholder")}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          />
          {provider?.key_url ? (
            <button
              type="button"
              className="self-start text-xs text-logo-primary underline cursor-pointer"
              onClick={() => openUrl(provider.key_url)}
            >
              {t("onboarding.cloud.whereKey", { provider: provider.label })}
            </button>
          ) : null}
        </label>

        <p className="text-xs text-text/60">{t("onboarding.cloud.privacy")}</p>

        <Button onClick={handleContinue} disabled={busy} size="lg">
          {busy ? t("onboarding.cloud.checking") : t("onboarding.cloud.continue")}
        </Button>
      </div>

      <button
        type="button"
        className="text-sm text-text/60 hover:text-text underline cursor-pointer"
        onClick={handleLocal}
      >
        {t("onboarding.cloud.useLocal")}
      </button>
    </div>
  );
};

export default CloudOnboarding;
