{
  "system_design": {
    "navigation": {
      "sidebar": [
        {"id": "create_project", "type": "button", "metadata": {"orientation": ["horizontal", "vertical"]}},
        {"id": "create_role", "type": "button", "link": "/role-center"},
        {"id": "my_projects", "type": "collection", "filter": {
          "params": ["orientation", "status(active/archived)", "last_modified"],
          "sort": ["create_time", "last_session_time"]
        }},
        {"id": "my_roles", "type": "collection", "source": ["cloned", "custom"]},
        {"id": "session_records", "search": {
          "index_fields": ["project_id", "timestamp", "role_id", "session_type"],
          "export_format": ["csv", "json"]
        }},
        {"id": "knowledge_base", "quota": {"used": "MB", "total": "GB"}, "file_types": ["docx", "xlsx"]},
        {"id": "material_lib", "media_types": ["jpg", "png", "mp4", "webm"], "max_size": "2GB"},
        {"id": "data_analytics", "modules": ["visitor_stats", "session_analysis", "hot_questions"]},
        {"id": "concurrency_mgr", "columns": ["token", "project", "expiry_policy", "last_active"]}
      ],
      "user_panel": {
        "actions": ["switch_user", "logout", "change_password"],
        "security": {
          "password_policy": {"min_length": 8, "complexity": true},
          "session_timeout": 1800
        },
        "quota": {
          "material": {"used": "Number", "total": "Number", "alert_threshold": 90},
          "knowledge": {"used": "Number", "total": "Number", "alert_threshold": 90},
          "concurrency": {"max": "Number", "used": "Number"}
        }
      }
    },

    "project_engine": {
      "template": {
        "orientation": {"enum": [0, 1], "0": "vertical", "1": "horizontal"},
        "preset_configs": ["education", "finance", "healthcare"]
      },
      "node_config": {
        "background": {
          "source": ["system", "custom"],
          "validation": {
            "image": {"types": ["jpg", "png"], "max_size": "5MB"},
            "video": {"types": ["mp4"], "max_size": "200MB"}
          }
        },
        "ui_components": {
          "drag_config": {
            "coordinate": {"x": "number", "y": "number"},
            "constraints": {"grid_snap": true, "boundary_check": true}
          },
          "element_types": ["button", "text_field", "media_player"]
        }
      },
      "global_config": {
        "digital_human": {
          "model_config": {
            "video_sources": {"update_strategy": "version_control"},
            "tts": {
              "voice_lib": {"api": "https://tts.api/v2", "rate": {"min": 0.5, "max": 2.0}},
              "emotion_mapping": {"happy": 1, "neutral": 0, "angry": -1}
            }
          }
        },
        "interaction": {
          "default_mode": {"enum": ["voice", "text"]},
          "voice_control": {"type": ["hold_to_talk", "continuous"]},
          "wakeup": {
            "methods": ["voice_keyword", "face_recognition"],
            "sensitivity": {"level": 3, "threshold": 0.75}
          },
          "interrupt": {
            "phrases": ["stop", "cancel"],
            "clear_delay": {"min": 0, "max": 300, "default": 5}
          }
        },
        "sleep_mode": {
          "activation": {"timeout": 600, "phrases": ["休眠", "休息"]},
          "wakeup": {"phrases": ["唤醒", "开始"], "retry_limit": 3}
        }
      }
    },

    "role_center": {
      "structure": {
        "role_mall": {
          "preset_roles": {
            "filter_tags": ["industry", "language", "skill"],
            "ranking": ["popularity", "rating"]
          },
          "import_policy": {"max_clones": 5, "cool_down": 86400}
        },
        "my_roles": {
          "version_control": {
            "snapshot_strategy": "major_change",
            "max_versions": 10
          },
          "edit_lock": {"enable": true, "timeout": 300}
        }
      },
      "clone_mechanism": {
        "dependency": {"original_id": "foreign_key", "version_hash": "sha256"},
        "isolation_level": "deep_copy_with_ref"
      }
    },

    "data_system": {
      "analytics": {
        "visitor_stats": {
          "metrics": ["sessions_count", "avg_duration", "unique_users"],
          "time_granularity": ["hourly", "daily", "weekly"]
        },
        "intent_analysis": {
          "match_rate": {"formula": "matched_intents/total_questions"},
          "top_failed": {"limit": 20, "threshold": 0.1}
        },
        "hot_questions": {
          "ranking_algorithm": "weighted_score",
          "factors": ["frequency", "recency", "user_feedback"]
        }
      },
      "session_storage": {
        "metadata": {
          "device": {"os": "string", "browser": "string", "resolution": "array[number]"},
          "network": {"type": ["wifi", "4g", "5g"], "latency": "number"}
        },
        "compression": {"algorithm": "gzip", "ratio": 0.7}
      }
    },

    "concurrency_control": {
      "token_policy": {
        "generation": {"algorithm": "jwt", "expiry": 3600},
        "revocation": {
          "conditions": ["time_expired", "manual_revoke", "project_deleted"],
          "cleanup_delay": 300
        }
      },
      "monitoring": {
        "alert_rules": {
          "overload": {"threshold": 85},
          "abuse_detection": {"max_attempts": 5, "period": 60}
        }
      }
    },

    "api_endpoints": {
      "project": {
        "POST /projects": {
          "params": {
            "name": {"type": "string", "max": 50},
            "orientation": {"enum": [0,1]},
            "template_id": {"type": "uuid"}
          }
        },
        "PATCH /projects/{id}/config": {
          "body_schema": "$ref": "#/definitions/project_config"
        }
      },
      "analytics": {
        "GET /stats/visitors": {
          "params": {
            "time_range": {"type": "date_range"},
            "granularity": {"enum": ["hour", "day", "week"]}
          }
        },
        "GET /stats/hot_questions": {
          "params": {
            "top_n": {"type": "int", "max": 50},
            "time_window": {"type": "hours", "max": 720}
          }
        }
      }
    },

    "security": {
      "authentication": {
        "password": {
          "hashing": "bcrypt",
          "rotation_policy": 90
        },
        "jwt": {
          "algorithm": "RS256",
          "key_rotation": 30
        }
      },
      "audit_log": {
        "tracked_events": ["config_change", "role_clone", "data_export"],
        "retention": 365
      }
    }
  }
}

关键设计说明：
graph TD
    A[项目配置] --> B[节点配置]
    A --> C[全局配置]
    B --> D[背景管理系统]
    B --> E[UI组件引擎]
    C --> F[数字人管理系统]
    C --> G[交互规则引擎]
    C --> H[休眠控制模块]

analytics_dimensions:
  temporal: 
    - 按小时统计
    - 按天聚合
    - 周趋势分析
  spatial:
    - 地域分布
    - 网络环境
  behavioral:
    - 意图匹配模式
    - 交互深度分析

# 操作日志示例
{
  "timestamp": "2023-08-20T14:22:18Z",
  "user_id": "U123456",
  "event_type": "role_clone",
  "target_id": "ROLE-789",
  "ip_address": "192.168.1.100",
  "risk_level": 0
}

// 补充：
// 并发回收守护进程
func concurrencyCleaner() {
    for {
        expiredTokens := db.Query("SELECT token FROM concurrency WHERE expiry < NOW()")
        for _, token := range expiredTokens {
            revokeToken(token)
            logAction("auto_revoke", token)
        }
        time.Sleep(5 * time.Minute)
    }
}