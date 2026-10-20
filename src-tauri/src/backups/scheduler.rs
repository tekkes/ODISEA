use std::thread;
use std::time::{Duration, Instant};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use crate::backups::snapshot::create_zstd_snapshot;

pub struct BackupScheduler {
    running: Arc<AtomicBool>,
}

impl BackupScheduler {
    pub fn start() -> Self {
        let running = Arc::new(AtomicBool::new(true));
        let r = Arc::clone(&running);

        thread::spawn(move || {
            let mut last_hourly = Instant::now();
            let mut last_daily = Instant::now();
            let mut last_weekly = Instant::now();

            // Run initial hourly on startup
            let _ = create_zstd_snapshot("hourly");

            while r.load(Ordering::Relaxed) {
                // Sleep short interval to check flags
                thread::sleep(Duration::from_secs(60));

                let now = Instant::now();

                // Hourly check (3600s)
                if now.duration_since(last_hourly) >= Duration::from_secs(3600) {
                    let _ = create_zstd_snapshot("hourly");
                    last_hourly = now;
                }

                // Daily check (86400s)
                if now.duration_since(last_daily) >= Duration::from_secs(86400) {
                    let _ = create_zstd_snapshot("daily");
                    last_daily = now;
                }

                // Weekly check (604800s)
                if now.duration_since(last_weekly) >= Duration::from_secs(604800) {
                    let _ = create_zstd_snapshot("weekly");
                    last_weekly = now;
                }
            }
        });

        Self { running }
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::Relaxed);
    }
}
