-- Merchant onboarding hardening applied to production on 2026-08-16.
-- Extends the existing merchant_applications workflow instead of creating a parallel store model.
alter table public.merchant_applications add column if not exists legal_name text;
alter table public.merchant_applications add column if not exists document_type text;
alter table public.merchant_applications add column if not exists document_number text;
alter table public.merchant_applications add column if not exists address jsonb not null default '{}'::jsonb;
alter table public.merchant_applications add column if not exists business_type text;
alter table public.merchant_applications add column if not exists rejection_reason text;
create unique index if not exists merchant_applications_one_open_per_user on public.merchant_applications(applicant_user_id) where applicant_user_id is not null and status='pending';
-- The production migration also updates submit_merchant_application, review_merchant_application
-- and handle_new_user so new accounts are consumers first and merchant_owner is granted only after admin approval.
