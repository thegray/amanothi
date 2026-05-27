erDiagram
    USERS ||--o{ DOCS : owns
    DOCS ||--o{ DOC_TAGS : owns
    TAGS ||--o{ DOC_TAGS : owns

    USERS {
        bigint id
        string provider "google"
        string email
        string name
        string picture_url
        int token_version
        timestamp created_at
        timestamp updated_at
    }
    DOCS {
        bigint id
        bigint user_id
        text content
        text summary
        timestamp created_at
        timestamp updated_at
        string doc_type "md, list"
        string status "soft delete"
    }
    TAGS {
        int id
        string name
        string slug
    }
    DOC_TAGS {
        int tag_id
        bigint doc_id
    }