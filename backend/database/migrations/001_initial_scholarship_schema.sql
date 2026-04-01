-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the ScholarshipSource table (Trusted Sources)
CREATE TABLE IF NOT EXISTS scholarship_sources (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) NOT NULL,
    base_url VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_scraped TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES scholarship_sources(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount VARCHAR(100),
    deadline TIMESTAMPTZ,
    original_url VARCHAR(512) UNIQUE NOT NULL,
    embedding vector(768), -- For Gemini text-embedding-004
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster vector search
CREATE INDEX IF NOT EXISTS scholarships_embedding_idx ON scholarships USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
