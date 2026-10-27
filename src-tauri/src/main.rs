// TypeGuru Pro desktop shell (Tauri).
// Closing the main Windows window should always shut down the application,
// rather than leaving a TypeGuru Pro process running in the background.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .on_window_event(|window, event| {
            if window.label() == "main"
                && matches!(event, tauri::WindowEvent::CloseRequested { .. })
            {
                // The app has no background/tray mode. Request an application-level
                // exit so the Rust process and WebView terminate together.
                // Do not hide the window or call prevent_close().
                window.app_handle().exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running TypeGuru Pro");
}
