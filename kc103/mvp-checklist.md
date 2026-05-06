# KwenTech MVP Checklist (Live Tracker)

Last updated: 2026-05-05

## How to use this
- Update checkbox and status after each completed task.
- Keep scope locked to POC requirements in `prd.txt`.
- Use this file as the single source of truth for "what's next."

Status legend:
- `[x]` Done
- `[~]` In progress / partial
- `[ ]` Not started

## 1) Foundation (Phase 1)

### App shell and navigation
- [x] Protected app layout with sidebar navigation (`/dashboard`, `/properties`, `/tenants`, `/reminders`, `/invoices`, `/utilities`)
- [x] Landing + Login + Register routing flow
- [x] Basic dashboard summary cards and recent invoice preview

### Properties management (MVP - feature by feature)
#### Frontend experience
- [x] Properties list/grid UI
- [x] Add property dialog
- [x] Edit property flow
- [x] Delete property flow
- [x] Unit management per property (add/view units)

#### API integration (current sprint)
- [x] Backend route: `GET /api/properties` (user-scoped property list)
- [x] Backend route: `POST /api/properties` (create property with validation)
- [x] Backend route: `PUT /api/properties/:id` (update property)
- [x] Backend route: `DELETE /api/properties/:id` (delete property)
- [x] Backend route: `POST /api/properties/:id/units` (append unit to property)
- [x] Backend route: `PUT /api/properties/:id/units/:unitId` (update unit)
- [x] Backend route: `DELETE /api/properties/:id/units/:unitId` (delete unit)
- [x] Frontend `api` client methods for all properties endpoints
- [x] Properties page wired to backend APIs for load/add/edit/delete/add-unit/edit-unit/delete-unit
- [~] Fallback strategy: local storage used if API/table is unavailable

#### Database and hardening (next)
- [x] Supabase SQL migration created for `rental_properties` table (`backend/supabase/migrations/20260505_create_rental_properties.sql`)
- [x] Row Level Security policy defined in migration: user can only access own properties (`user_id = auth.uid()`)
- [ ] Validation/error message consistency pass (frontend + backend)
- [x] Loading/empty/error states for API-backed properties flow
- [x] Unit edit/delete API + frontend actions
- [ ] Automated API tests for properties endpoints

## 2) Operations (Phase 2)

### Tenants management (POC)
- [x] Tenant list/search UI
- [x] Add tenant and assign to property/unit
- [x] Tenant detail dialog (lease period, due day, contract filename)
- [x] Basic payment status badge in table/detail
- [x] Local storage persistence for tenant data

### Reminder flow (simulation)
- [x] Reminder history list
- [x] New reminder composer (tenant, subject, message, schedule)
- [x] Mock "send reminder" action with success feedback
- [x] Local storage persistence for reminders

## 3) Billing (Phase 3)

### Invoice generator
- [x] Invoice list view
- [x] Generate invoice from selected property/unit with assigned tenant
- [x] Auto-compute total from base rent + utilities
- [x] Due date handling tied to tenant due day
- [x] Local storage persistence for invoices

### Invoice output
- [x] PDF preview/export via `jsPDF` (mock invoice format)
- [~] Invoice status lifecycle (currently mostly Draft; no full workflow for Sent/Paid/Overdue transitions)

## 4) Documents (Phase 4 - POC Lite)

### Tenant documents/contracts
- [~] Contract reference exists in tenant record (`contractFileName`)
- [ ] Document list UI per tenant
- [ ] Upload placeholder flow per tenant (no real storage needed for POC)
- [ ] Basic document metadata fields (type, upload date, notes)

## 5) POC quality gates

### UX + validation
- [~] Form validation present on core required fields; edge-case validation still limited
- [ ] Empty/loading/error states reviewed across all pages
- [ ] Mobile responsiveness pass for all core pages

### Demo readiness
- [x] Mock data + local persistence supports demo flow
- [ ] End-to-end scripted demo walkthrough (property -> tenant -> reminder -> invoice)
- [ ] Final POC polish pass (copy consistency, spacing, visual cleanup)

## 6) Out-of-scope (do not build yet)
- [ ] Real payment gateway integration
- [ ] Real email provider integration
- [ ] E-signatures/legal automation
- [ ] Accounting/tax integrations
- [ ] Advanced multi-user RBAC

## Next build queue (recommended order)
1. Documents POC Lite: tenant document list + upload placeholder + metadata.
2. Invoice status workflow: Draft -> Sent -> Paid/Overdue with simple actions.
3. Demo readiness pass: walkthrough script + UX polish + responsive checks.

## Definition of MVP done (POC)
- [ ] Landlord can manage properties and units from one place.
- [ ] Landlord can create and manage tenants with lease metadata.
- [ ] Landlord can send reminder emails via simulated flow.
- [ ] Landlord can generate and preview/export invoices.
- [ ] Landlord can see basic tenant document placeholders and metadata.
