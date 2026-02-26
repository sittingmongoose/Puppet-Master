## 8. Testing

### 8.1 Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_blocks_migrate_fresh() {
        let guard = BashGuard::new(None).unwrap();
        let cmd = "php artisan migrate:fresh --seed";
        assert!(guard.check_command(cmd).is_err());
    }
    
    #[test]
    fn test_allows_safe_migrate() {
        let guard = BashGuard::new(None).unwrap();
        let cmd = "php artisan migrate";
        assert!(guard.check_command(cmd).is_ok());
    }
    
    #[test]
    fn test_respects_override() {
        std::env::set_var("PUPPET_MASTER_ALLOW_DESTRUCTIVE", "1");
        let guard = BashGuard::new(None).unwrap();
        let cmd = "php artisan migrate:fresh";
        assert!(guard.check_command(cmd).is_ok());
        std::env::remove_var("PUPPET_MASTER_ALLOW_DESTRUCTIVE");
    }
    
    #[test]
    fn test_allows_safe_commands() {
        let guard = BashGuard::new(None).unwrap();
        let safe_commands = vec![
            "php artisan migrate",
            "npm install",
            "cargo build",
            "git status",
            "ls -la",
        ];
        for cmd in safe_commands {
            assert!(guard.check_command(cmd).is_ok(), "Safe command blocked: {}", cmd);
        }
    }
    
    #[test]
    fn test_blocks_various_destructive_patterns() {
        let guard = BashGuard::new(None).unwrap();
        let destructive_commands = vec![
            "php artisan migrate:fresh",
            "rails db:drop",
            "django-admin flush",
            "prisma migrate reset",
            "diesel database reset",
            "mix ecto.drop",
        ];
        for cmd in destructive_commands {
            assert!(guard.check_command(cmd).is_err(), "Destructive command allowed: {}", cmd);
        }
    }
    
    #[test]
    fn test_prompt_extraction() {
        let guard = BashGuard::new(None).unwrap();
        let prompt = r#"
        Please run this command:
        ```bash
        php artisan migrate:fresh --seed
        ```
        "#;
        assert!(guard.check_prompt(prompt).is_err());
    }
    
    #[test]
    fn test_disabled_guard_allows_all() {
        let guard = BashGuard::disabled();
        assert!(guard.check_command("php artisan migrate:fresh").is_ok());
    }
}
```

### 8.2 Integration Tests

Test with actual platform runners:

```rust
#[tokio::test]
async fn test_runner_blocks_destructive() {
    let runner = BaseRunner::new("php".to_string(), Platform::Cursor);
    let request = ExecutionRequest {
        prompt: "Run php artisan migrate:fresh".to_string(),
        // ...
    };
    
    let result = runner.execute(&request).await;
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("Blocked"));
}
```

---

