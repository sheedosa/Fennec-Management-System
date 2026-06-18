-- Invoice attachment: Storage object key (nullable). An invoice is either
-- structured (invoice_items) or a file (file_path) or both.
alter table invoices add column if not exists file_path text;
