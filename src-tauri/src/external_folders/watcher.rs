use notify::{RecommendedWatcher, RecursiveMode, Watcher, Config, EventKind};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::mpsc::channel;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalFileEvent {
    pub event_type: String, // "create" | "modify" | "rename" | "delete"
    pub path: String,
    pub is_directory: bool,
}

pub struct FolderWatcherManager {
    watchers: Arc<Mutex<HashMap<PathBuf, RecommendedWatcher>>>,
    recent_events: Arc<Mutex<HashMap<PathBuf, Instant>>>,
}

impl FolderWatcherManager {
    pub fn new() -> Self {
        Self {
            watchers: Arc::new(Mutex::new(HashMap::new())),
            recent_events: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn watch_folder<F>(&self, folder_path: &Path, on_event: F) -> Result<(), String>
    where
        F: Fn(ExternalFileEvent) + Send + Sync + 'static,
    {
        let canonical_path = folder_path.canonicalize().unwrap_or_else(|_| folder_path.to_path_buf());
        let (tx, rx) = channel();

        let mut watcher = RecommendedWatcher::new(
            move |res| {
                let _ = tx.send(res);
            },
            Config::default(),
        )
        .map_err(|e| e.to_string())?;

        watcher
            .watch(&canonical_path, RecursiveMode::Recursive)
            .map_err(|e| e.to_string())?;

        let recent_map = Arc::clone(&self.recent_events);
        let on_event_cb = Arc::new(on_event);

        std::thread::spawn(move || {
            let debounce_limit = Duration::from_millis(80); // < 100 ms requirement

            for res in rx {
                if let Ok(event) = res {
                    let event_type = match event.kind {
                        EventKind::Create(_) => "create",
                        EventKind::Modify(_) => "modify",
                        EventKind::Remove(_) => "delete",
                        _ => continue,
                    };

                    for path in event.paths {
                        // Check extension
                        let is_relevant = path.is_dir() || path.extension().map(|e| {
                            let ext = e.to_string_lossy().to_lowercase();
                            ext == "md" || ext == "txt" || ext == "mdxl" || ext == "ulyz" || ext == "odisea"
                        }).unwrap_or(false);

                        if !is_relevant {
                            continue;
                        }

                        // Debounce duplicate events on same path
                        let mut recents = recent_map.lock().unwrap();
                        let now = Instant::now();
                        if let Some(last_time) = recents.get(&path) {
                            if now.duration_since(*last_time) < debounce_limit {
                                continue;
                            }
                        }
                        recents.insert(path.clone(), now);
                        drop(recents);

                        let file_event = ExternalFileEvent {
                            event_type: event_type.to_string(),
                            path: path.to_string_lossy().to_string(),
                            is_directory: path.is_dir(),
                        };

                        (on_event_cb)(file_event);
                    }
                }
            }
        });

        let mut map = self.watchers.lock().unwrap();
        map.insert(canonical_path, watcher);
        Ok(())
    }

    pub fn unwatch_folder(&self, folder_path: &Path) {
        let canonical_path = folder_path.canonicalize().unwrap_or_else(|_| folder_path.to_path_buf());
        let mut map = self.watchers.lock().unwrap();
        if let Some(mut watcher) = map.remove(&canonical_path) {
            let _ = watcher.unwatch(&canonical_path);
        }
    }
}

impl Default for FolderWatcherManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_folder_watcher_creation() {
        let temp_dir = std::env::temp_dir().join("odisea_watcher_test");
        let _ = std::fs::create_dir_all(&temp_dir);

        let manager = FolderWatcherManager::new();
        let result = manager.watch_folder(&temp_dir, |_evt| {});
        assert!(result.is_ok());

        manager.unwatch_folder(&temp_dir);
        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
