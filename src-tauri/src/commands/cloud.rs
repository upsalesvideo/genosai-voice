//! Settings commands for cloud transcription (Genosai Voice).

use crate::cloud_stt::{self, CloudSttProvider};
use crate::settings::{get_settings, write_settings};
use tauri::AppHandle;

fn ensure_provider(provider_id: &str) -> Result<(), String> {
    cloud_stt::find_provider(provider_id)
        .map(|_| ())
        .ok_or_else(|| format!("Unknown cloud provider '{}'", provider_id))
}

#[tauri::command]
#[specta::specta]
pub fn get_cloud_stt_providers() -> Vec<CloudSttProvider> {
    cloud_stt::cloud_stt_providers()
}

#[tauri::command]
#[specta::specta]
pub fn change_cloud_stt_enabled_setting(app: AppHandle, enabled: bool) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.cloud_stt_enabled = enabled;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn set_cloud_stt_provider(app: AppHandle, provider_id: String) -> Result<(), String> {
    ensure_provider(&provider_id)?;
    let mut settings = get_settings(&app);
    // Keep AI correction on the same provider when it can do chat, so a single
    // key covers both steps.
    if settings.post_process_provider(&provider_id).is_some() {
        settings.post_process_provider_id = provider_id.clone();
    }
    settings.cloud_stt_provider_id = provider_id;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn change_cloud_stt_api_key_setting(
    app: AppHandle,
    provider_id: String,
    api_key: String,
) -> Result<(), String> {
    ensure_provider(&provider_id)?;
    let mut settings = get_settings(&app);
    settings
        .cloud_stt_api_keys
        .insert(provider_id, api_key.trim().to_string());
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn change_cloud_stt_model_setting(
    app: AppHandle,
    provider_id: String,
    model: String,
) -> Result<(), String> {
    ensure_provider(&provider_id)?;
    let mut settings = get_settings(&app);
    settings
        .cloud_stt_models
        .insert(provider_id, model.trim().to_string());
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn change_cloud_stt_base_url_setting(
    app: AppHandle,
    provider_id: String,
    base_url: String,
) -> Result<(), String> {
    ensure_provider(&provider_id)?;
    let mut settings = get_settings(&app);
    settings
        .cloud_stt_base_urls
        .insert(provider_id, base_url.trim().to_string());
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn change_always_post_process_setting(app: AppHandle, enabled: bool) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.always_post_process = enabled;
    write_settings(&app, settings);
    Ok(())
}

/// Send half a second of near-silence to the active provider to verify the
/// key, model and network path. Returns the (usually empty) transcript.
#[tauri::command]
#[specta::specta]
pub async fn test_cloud_stt(app: AppHandle) -> Result<String, String> {
    let settings = get_settings(&app);
    let samples: Vec<f32> = (0..8_000)
        .map(|i| ((i as f32) * 0.05).sin() * 0.001)
        .collect();
    cloud_stt::transcribe(&settings, &samples)
        .await
        .map_err(|e| e.to_string())
}

/// Finish first-run setup for users who chose cloud transcription (no local
/// model download needed).
#[tauri::command]
#[specta::specta]
pub fn complete_cloud_onboarding(app: AppHandle) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.cloud_stt_enabled = true;
    settings.onboarding_completed = true;
    write_settings(&app, settings);
    Ok(())
}
