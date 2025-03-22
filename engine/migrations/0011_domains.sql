
-- create table domains (primary key site_id, domain)
-- site_id "s_89382ef9d1"
-- domain "luc.computer"
CREATE TABLE domains (
    site_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (site_id, domain)
);

-- create table pending_domains
-- site_id "s_89382ef9d1"
-- domain "luc.computer"
-- challenge "abcedfg"
-- status "pending"
-- created_at "2025-03-22 12:00:00"
-- updated_at "2025-03-22 12:00:00"
CREATE TABLE domains_pending (
    site_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    challenge VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (site_id, domain)
);
