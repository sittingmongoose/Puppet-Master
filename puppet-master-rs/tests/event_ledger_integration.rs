//! Event ledger integration tests
//!
//! Tests for SQLite event logging with concurrent access.

use puppet_master::state::{EventLedger, EventFilters};
use puppet_master::types::{PuppetMasterEvent, TierState, TierType, LogLevel};
use chrono::Utc;
use tempfile::TempDir;
use std::sync::Arc;
use std::thread;

#[test]
fn test_event_ledger_insert_and_query() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = EventLedger::new(&db_path).unwrap();

    // Create and insert an event
    let event = PuppetMasterEvent::TierChanged {
        tier_id: "PH0".to_string(),
        tier_type: TierType::Phase,
        from_state: TierState::Pending,
        to_state: TierState::Planning,
        timestamp: Utc::now(),
    };

    let event_id = ledger.insert_event(event).unwrap();
    assert!(!event_id.is_empty(), "Should return event ID");

    // Query all events
    let filters = EventFilters::default();
    let events = ledger.query_events(filters).unwrap();
    assert_eq!(events.len(), 1, "Should have 1 event");
}

#[test]
fn test_event_ledger_multiple_events() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = EventLedger::new(&db_path).unwrap();

    // Insert multiple events
    for i in 0..5 {
        let event = PuppetMasterEvent::TierChanged {
            tier_id: format!("PH{}", i),
            tier_type: TierType::Phase,
            from_state: TierState::Pending,
            to_state: TierState::Planning,
            timestamp: Utc::now(),
        };
        ledger.insert_event(event).unwrap();
    }

    // Query all
    let filters = EventFilters::default();
    let all_events = ledger.query_events(filters).unwrap();
    assert_eq!(all_events.len(), 5, "Should have 5 events");
}

#[test]
fn test_event_ledger_filter_by_type() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = EventLedger::new(&db_path).unwrap();

    // Insert different event types
    let event1 = PuppetMasterEvent::TierChanged {
        tier_id: "PH0".to_string(),
        tier_type: TierType::Phase,
        from_state: TierState::Pending,
        to_state: TierState::Planning,
        timestamp: Utc::now(),
    };
    ledger.insert_event(event1).unwrap();

    let event2 = PuppetMasterEvent::Log {
        level: LogLevel::Info,
        message: "Test message".to_string(),
        source: "test".to_string(),
        timestamp: Utc::now(),
    };
    ledger.insert_event(event2).unwrap();

    // Query by type
    let filters = EventFilters {
        event_type: Some("tier_changed".to_string()),
        ..Default::default()
    };
    let tier_events = ledger.query_events(filters).unwrap();
    assert_eq!(tier_events.len(), 1, "Should have 1 TierChanged event");
}

#[test]
fn test_event_ledger_filter_by_tier() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = EventLedger::new(&db_path).unwrap();

    // Insert events for different tiers
    for i in 0..3 {
        let event = PuppetMasterEvent::TierChanged {
            tier_id: "PH0".to_string(),
            tier_type: TierType::Phase,
            from_state: TierState::Pending,
            to_state: TierState::Planning,
            timestamp: Utc::now(),
        };
        ledger.insert_event(event).unwrap();
    }

    let event = PuppetMasterEvent::TierChanged {
        tier_id: "PH0-T01".to_string(),
        tier_type: TierType::Task,
        from_state: TierState::Pending,
        to_state: TierState::Planning,
        timestamp: Utc::now(),
    };
    ledger.insert_event(event).unwrap();

    // Query by tier ID
    let filters = EventFilters {
        tier_id: Some("PH0".to_string()),
        ..Default::default()
    };
    let ph0_events = ledger.query_events(filters).unwrap();
    assert_eq!(ph0_events.len(), 3, "Should have 3 events for PH0");
}

#[test]
fn test_event_ledger_large_event_count() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = EventLedger::new(&db_path).unwrap();

    // Insert 100 events (reduced from 1000 for faster testing)
    for i in 0..100 {
        let event = PuppetMasterEvent::TierChanged {
            tier_id: format!("PH{}", i % 10),
            tier_type: TierType::Phase,
            from_state: TierState::Pending,
            to_state: TierState::Planning,
            timestamp: Utc::now(),
        };
        ledger.insert_event(event).unwrap();
    }

    // Query all - should handle result sets
    let filters = EventFilters::default();
    let all_events = ledger.query_events(filters).unwrap();
    assert_eq!(all_events.len(), 100, "Should have 100 events");

    // Query specific tier - should be fast due to indexes
    let filters = EventFilters {
        tier_id: Some("PH5".to_string()),
        ..Default::default()
    };
    let ph5_events = ledger.query_events(filters).unwrap();
    assert_eq!(ph5_events.len(), 10, "Should have 10 events for PH5");
}

#[test]
fn test_event_ledger_concurrent_reads() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = Arc::new(EventLedger::new(&db_path).unwrap());

    // Insert some initial events
    for i in 0..10 {
        let event = PuppetMasterEvent::TierChanged {
            tier_id: format!("PH{}", i),
            tier_type: TierType::Phase,
            from_state: TierState::Pending,
            to_state: TierState::Planning,
            timestamp: Utc::now(),
        };
        ledger.insert_event(event).unwrap();
    }

    // Spawn multiple reader threads
    let mut handles = vec![];
    for _ in 0..5 {
        let ledger_clone = Arc::clone(&ledger);
        let handle = thread::spawn(move || {
            // Each thread reads all events
            let filters = EventFilters::default();
            let events = ledger_clone.query_events(filters).unwrap();
            assert!(events.len() >= 10, "Should read at least 10 events");
        });
        handles.push(handle);
    }

    // Wait for all threads
    for handle in handles {
        handle.join().unwrap();
    }
}

#[test]
fn test_event_ledger_concurrent_writes() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = Arc::new(EventLedger::new(&db_path).unwrap());

    // Spawn multiple writer threads
    let mut handles = vec![];
    for thread_id in 0..5 {
        let ledger_clone = Arc::clone(&ledger);
        let handle = thread::spawn(move || {
            // Each thread writes 10 events
            for i in 0..10 {
                let event = PuppetMasterEvent::TierChanged {
                    tier_id: format!("PH{}-{}", thread_id, i),
                    tier_type: TierType::Phase,
                    from_state: TierState::Pending,
                    to_state: TierState::Planning,
                    timestamp: Utc::now(),
                };
                ledger_clone.insert_event(event).unwrap();
            }
        });
        handles.push(handle);
    }

    // Wait for all threads
    for handle in handles {
        handle.join().unwrap();
    }

    // Verify all events were written
    let filters = EventFilters::default();
    let all_events = ledger.query_events(filters).unwrap();
    assert_eq!(all_events.len(), 50, "Should have 50 events total");
}

#[test]
fn test_event_ledger_persistence() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    // Create ledger and insert events
    {
        let ledger = EventLedger::new(&db_path).unwrap();
        for i in 0..5 {
            let event = PuppetMasterEvent::TierChanged {
                tier_id: format!("PH{}", i),
                tier_type: TierType::Phase,
                from_state: TierState::Pending,
                to_state: TierState::Planning,
                timestamp: Utc::now(),
            };
            ledger.insert_event(event).unwrap();
        }
    } // ledger dropped here

    // Open ledger again and verify data persisted
    {
        let ledger = EventLedger::new(&db_path).unwrap();
        let filters = EventFilters::default();
        let events = ledger.query_events(filters).unwrap();
        assert_eq!(events.len(), 5, "Events should persist after reopen");
    }
}

#[test]
fn test_event_ledger_count() {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("events.db");

    let ledger = EventLedger::new(&db_path).unwrap();

    // Insert events
    for i in 0..10 {
        let event = PuppetMasterEvent::TierChanged {
            tier_id: format!("PH{}", i % 3),
            tier_type: TierType::Phase,
            from_state: TierState::Pending,
            to_state: TierState::Planning,
            timestamp: Utc::now(),
        };
        ledger.insert_event(event).unwrap();
    }

    // Count all events
    let filters = EventFilters::default();
    let count = ledger.count_events(filters).unwrap();
    assert_eq!(count, 10, "Should count 10 events");

    // Count events for specific tier
    let filters = EventFilters {
        tier_id: Some("PH0".to_string()),
        ..Default::default()
    };
    let count = ledger.count_events(filters).unwrap();
    assert!(count >= 3 && count <= 4, "Should have 3-4 events for PH0");
}
