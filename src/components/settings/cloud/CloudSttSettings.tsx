import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { commands } from "@/bindings";
import {
  Dropdown,
  SettingContainer,
  SettingsGroup,
  ToggleSwitch,
} from "@/components/ui";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { ApiKeyField } from "../PostProcessingSettingsApi/ApiKeyField";
import { useSettings } from "../../../hooks/useSettings";
import { useCloudProviders } from "./useCloudProviders";

const LANGUAGE_CODES = ["auto", "ru", "en", "uk", "kk", "be", "de", "es", "fr"];

export const CloudSttSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, getSetting, updateSetting, isUpdating, refreshSettings } =
    useSettings();
  const providers = useCloudProviders();
  const [testing, setTesting] = useState(false);

  const enabled = getSetting("cloud_stt_enabled") ?? true;
  const providerId = getSetting("cloud_stt_provider_id") ?? "gemini";
  const provider = providers.find((p) => p.id === providerId);
  const apiKey = settings?.cloud_stt_api_keys?.[providerId] ?? "";
  const model =
    settings?.cloud_stt_models?.[providerId] || provider?.default_model || "";
  const baseUrl =
    settings?.cloud_stt_base_urls?.[providerId] || provider?.base_url || "";
  const language = getSetting("selected_language") ?? "auto";

  const [modelDraft, setModelDraft] = useState(model);
  const [baseUrlDraft, setBaseUrlDraft] = useState(baseUrl);
  useEffect(() => setModelDraft(model), [model]);
  useEffect(() => setBaseUrlDraft(baseUrl), [baseUrl]);

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } finally {
      await refreshSettings();
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await commands.testCloudStt();
      if (res.status === "ok") {
        toast.success(t("settings.cloud.test.ok"));
      } else {
        toast.error(t("settings.cloud.test.failed", { error: res.error }));
      }
    } finally {
      setTesting(false);
    }
  };

  const modelOptions = Array.from(
    new Set([...(provider?.models ?? []), model].filter(Boolean)),
  ).map((m) => ({ value: m, label: m }));

  return (
    <SettingsGroup title={t("settings.cloud.title")}>
      <ToggleSwitch
        checked={enabled}
        onChange={(v) => updateSetting("cloud_stt_enabled", v)}
        isUpdating={isUpdating("cloud_stt_enabled")}
        label={t("settings.cloud.enabled.title")}
        description={t("settings.cloud.enabled.description")}
        descriptionMode="tooltip"
        grouped={true}
      />
      {enabled && (
        <>
          <SettingContainer
            title={t("settings.cloud.provider.title")}
            description={t("settings.cloud.provider.description")}
            descriptionMode="tooltip"
            layout="horizontal"
            grouped={true}
          >
            <Dropdown
              options={providers.map((p) => ({ value: p.id, label: p.label }))}
              selectedValue={providerId}
              onSelect={(id) => run(() => commands.setCloudSttProvider(id))}
              className="min-w-[240px]"
            />
          </SettingContainer>

          <SettingContainer
            title={t("settings.cloud.apiKey.title")}
            description={t("settings.cloud.apiKey.description")}
            descriptionMode="tooltip"
            layout="horizontal"
            grouped={true}
          >
            <div className="flex items-center gap-2">
              <ApiKeyField
                value={apiKey}
                onBlur={(v) =>
                  v !== apiKey &&
                  run(() => commands.changeCloudSttApiKeySetting(providerId, v))
                }
                placeholder={t("settings.cloud.apiKey.placeholder")}
                disabled={false}
                className="min-w-[260px]"
              />
              {provider?.key_url ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openUrl(provider.key_url)}
                >
                  {t("settings.cloud.apiKey.getKey")}
                </Button>
              ) : null}
            </div>
          </SettingContainer>

          <SettingContainer
            title={t("settings.cloud.model.title")}
            description={t("settings.cloud.model.description")}
            descriptionMode="tooltip"
            layout="horizontal"
            grouped={true}
          >
            <div className="flex items-center gap-2">
              <Dropdown
                options={modelOptions}
                selectedValue={model}
                onSelect={(m) =>
                  run(() => commands.changeCloudSttModelSetting(providerId, m))
                }
                className="min-w-[200px]"
              />
              <Input
                value={modelDraft}
                onChange={(e) => setModelDraft(e.target.value)}
                onBlur={() =>
                  modelDraft !== model &&
                  run(() =>
                    commands.changeCloudSttModelSetting(providerId, modelDraft),
                  )
                }
                variant="compact"
                className="w-[160px]"
                aria-label={t("settings.cloud.model.custom")}
              />
            </div>
          </SettingContainer>

          <SettingContainer
            title={t("settings.cloud.language.title")}
            description={t("settings.cloud.language.description")}
            descriptionMode="tooltip"
            layout="horizontal"
            grouped={true}
          >
            <Dropdown
              options={LANGUAGE_CODES.map((code) => ({
                value: code,
                label: t(`settings.cloud.language.options.${code}`),
              }))}
              selectedValue={LANGUAGE_CODES.includes(language) ? language : "auto"}
              onSelect={(code) => updateSetting("selected_language", code)}
              className="min-w-[200px]"
            />
          </SettingContainer>

          <SettingContainer
            title={t("settings.cloud.baseUrl.title")}
            description={t("settings.cloud.baseUrl.description")}
            descriptionMode="tooltip"
            layout="horizontal"
            grouped={true}
          >
            <Input
              value={baseUrlDraft}
              onChange={(e) => setBaseUrlDraft(e.target.value)}
              onBlur={() =>
                baseUrlDraft !== baseUrl &&
                run(() =>
                  commands.changeCloudSttBaseUrlSetting(
                    providerId,
                    baseUrlDraft === provider?.base_url ? "" : baseUrlDraft,
                  ),
                )
              }
              variant="compact"
              className="min-w-[320px]"
            />
          </SettingContainer>

          <ToggleSwitch
            checked={getSetting("always_post_process") ?? true}
            onChange={(v) => updateSetting("always_post_process", v)}
            isUpdating={isUpdating("always_post_process")}
            label={t("settings.cloud.correction.title")}
            description={t("settings.cloud.correction.description")}
            descriptionMode="tooltip"
            grouped={true}
          />

          <SettingContainer
            title={t("settings.cloud.test.title")}
            description={t("settings.cloud.test.description")}
            descriptionMode="tooltip"
            layout="horizontal"
            grouped={true}
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={testing}
              onClick={handleTest}
            >
              {testing
                ? t("settings.cloud.test.running")
                : t("settings.cloud.test.button")}
            </Button>
          </SettingContainer>
        </>
      )}
    </SettingsGroup>
  );
};
