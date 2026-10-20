use serde::{Deserialize, Serialize};
use chrono::{Local, NaiveDate, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetailedTextStatistics {
    pub word_count: usize,
    pub character_count: usize,
    pub character_count_no_spaces: usize,
    pub sentence_count: usize,
    pub paragraph_count: usize,
    pub line_count: usize,
    pub page_count: f64,
    pub reading_time_slow_minutes: f64,
    pub reading_time_medium_minutes: f64,
    pub reading_time_fast_minutes: f64,
    pub speaking_time_minutes: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyProgress {
    pub date: String, // YYYY-MM-DD
    pub word_count: usize,
    pub words_added: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WritingGoalData {
    pub target_words: usize,
    pub goal_mode: String, // "at_least", "at_most", "exact"
    pub deadline_date: Option<String>, // YYYY-MM-DD
    pub daily_quota: usize,
    pub progress_percent: f64,
    pub status_color: String, // "orange", "blue", "green", "red"
    pub history: Vec<DailyProgress>,
}

pub struct StatisticsEngine;

impl StatisticsEngine {
    pub fn analyze(text: &str) -> DetailedTextStatistics {
        let words: Vec<&str> = text.split_whitespace().collect();
        let word_count = words.len();

        let character_count = text.chars().count();
        let character_count_no_spaces = text.chars().filter(|c| !c.is_whitespace()).count();

        let sentence_count = text
            .split(|c| c == '.' || c == '!' || c == '?' || c == '…')
            .filter(|s| !s.trim().is_empty())
            .count();

        let paragraph_count = text
            .lines()
            .filter(|l| !l.trim().is_empty())
            .count();

        let line_count = text.lines().count().max(1);

        // Standard publishing page: 250 words per page
        let page_count = if word_count == 0 {
            0.0
        } else {
            ((word_count as f64) / 250.0 * 10.0).round() / 10.0
        };

        // Reading speeds (words per minute):
        // Slow: 150 wpm, Medium: 200 wpm, Fast: 250 wpm, Speaking: 130 wpm
        let reading_time_slow_minutes = ((word_count as f64) / 150.0 * 10.0).round() / 10.0;
        let reading_time_medium_minutes = ((word_count as f64) / 200.0 * 10.0).round() / 10.0;
        let reading_time_fast_minutes = ((word_count as f64) / 250.0 * 10.0).round() / 10.0;
        let speaking_time_minutes = ((word_count as f64) / 130.0 * 10.0).round() / 10.0;

        DetailedTextStatistics {
            word_count,
            character_count,
            character_count_no_spaces,
            sentence_count,
            paragraph_count,
            line_count,
            page_count,
            reading_time_slow_minutes,
            reading_time_medium_minutes,
            reading_time_fast_minutes,
            speaking_time_minutes,
        }
    }

    pub fn calculate_goal_progress(
        current_words: usize,
        goal_json: Option<&str>,
    ) -> Option<WritingGoalData> {
        let json_str = goal_json?;
        let parsed: serde_json::Value = serde_json::from_str(json_str).ok()?;

        let target_words = parsed["target_words"].as_u64().unwrap_or(0) as usize;
        if target_words == 0 {
            return None;
        }

        let goal_mode = parsed["goal_mode"]
            .as_str()
            .unwrap_or("at_least")
            .to_string();

        let deadline_date = parsed["deadline_date"]
            .as_str()
            .map(|s| s.to_string());

        let progress_percent = ((current_words as f64) / (target_words as f64) * 100.0).round();

        // Color coding rules:
        // - orange on start (< 20%)
        // - blue in progress (20% - 99%)
        // - green on reaching goal (>= 100% in at_least/exact, or <= 100% in at_most)
        // - red if exceeding limit in mode "at_most" (> 100%)
        let status_color = if goal_mode == "at_most" {
            if current_words > target_words {
                "red".to_string()
            } else if progress_percent >= 80.0 {
                "green".to_string()
            } else if progress_percent >= 20.0 {
                "blue".to_string()
            } else {
                "orange".to_string()
            }
        } else if progress_percent >= 100.0 {
            "green".to_string()
        } else if progress_percent >= 20.0 {
            "blue".to_string()
        } else {
            "orange".to_string()
        };

        // Daily quota calculation:
        let daily_quota = if let Some(ref deadline_str) = deadline_date {
            if let Ok(deadline) = NaiveDate::parse_from_str(deadline_str, "%Y-%m-%d") {
                let today = Local::now().date_naive();
                let days_left = (deadline - today).num_days().max(1) as usize;
                let words_remaining = target_words.saturating_sub(current_words);
                (words_remaining + days_left - 1) / days_left
            } else {
                0
            }
        } else {
            0
        };

        // Parse or generate 30-day history
        let mut history: Vec<DailyProgress> = Vec::new();
        if let Some(history_array) = parsed["history"].as_array() {
            for item in history_array {
                if let (Some(date), Some(count)) = (item["date"].as_str(), item["word_count"].as_u64()) {
                    let words_added = item["words_added"].as_i64().unwrap_or(0);
                    history.push(DailyProgress {
                        date: date.to_string(),
                        word_count: count as usize,
                        words_added,
                    });
                }
            }
        }

        // If history is empty, synthesize a 30-day baseline curve ending with today's count
        if history.is_empty() {
            let today = Local::now().date_naive();
            for i in (0..30).rev() {
                let d = today - Duration::days(i);
                let factor = ((30 - i) as f64) / 30.0;
                let day_count = (current_words as f64 * factor).round() as usize;
                let day_added = if i == 29 {
                    day_count as i64
                } else {
                    let prev_factor = ((29 - i) as f64) / 30.0;
                    (day_count as i64) - ((current_words as f64 * prev_factor).round() as i64)
                };
                history.push(DailyProgress {
                    date: d.format("%Y-%m-%d").to_string(),
                    word_count: day_count,
                    words_added: day_added.max(0),
                });
            }
        }

        Some(WritingGoalData {
            target_words,
            goal_mode,
            deadline_date,
            daily_quota,
            progress_percent,
            status_color,
            history,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detailed_statistics_calculation() {
        let sample = "Este es un texto de prueba para Odisea en Windows 11.\n\nContiene dos párrafos y varias palabras clave.";
        let stats = StatisticsEngine::analyze(sample);

        assert_eq!(stats.word_count, 18);
        assert_eq!(stats.paragraph_count, 2);
        assert!(stats.reading_time_slow_minutes > 0.0);
        assert!(stats.page_count > 0.0);
    }

    #[test]
    fn test_goal_progress_and_color_coding() {
        let goal_json = r#"{"target_words": 1000, "goal_mode": "at_least", "deadline_date": "2026-12-31"}"#;
        let goal = StatisticsEngine::calculate_goal_progress(100, Some(goal_json)).unwrap();
        assert_eq!(goal.status_color, "orange");

        let goal_mid = StatisticsEngine::calculate_goal_progress(500, Some(goal_json)).unwrap();
        assert_eq!(goal_mid.status_color, "blue");

        let goal_done = StatisticsEngine::calculate_goal_progress(1050, Some(goal_json)).unwrap();
        assert_eq!(goal_done.status_color, "green");

        let goal_at_most_exceeded = StatisticsEngine::calculate_goal_progress(
            1200,
            Some(r#"{"target_words": 1000, "goal_mode": "at_most"}"#),
        ).unwrap();
        assert_eq!(goal_at_most_exceeded.status_color, "red");
    }
}
