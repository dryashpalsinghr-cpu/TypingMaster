// TypeGuru Pro desktop shell (Tauri).
// Kept intentionally minimal for Phase 1/2: the app is otherwise the same
// React/TypeScript codebase used in the browser. Desktop-only features
// (system tray, start-with-Windows, global TypingMeter) are added here in
// Phase 8, behind the DesktopIntegrationService interface on the frontend
// so the browser build never depends on Tauri APIs directly.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running TypeGuru Pro");
}
