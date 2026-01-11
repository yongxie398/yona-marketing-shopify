# PRD: AI Marketing & Sales Agent for E-commerce

## 1. Product Overview (Enhanced)

### Product Name
**AI Revenue Agent for Shopify**

*Naming principle: outcome-first, platform-explicit (important for App Store conversion)*

### Expanded Product Vision
Enable small e-commerce stores to outsource revenue growth execution to an autonomous AI agent that:

- Observes shopper behavior
- Decides the optimal intervention  
- Communicates with customers
- Learns from results
- Improves revenue continuously

### Non-goal (Explicit)
This product is not a marketing assistant or analytics tool. It is a **revenue executor**.

### Product Principles (Critical)

1. **Outcome > Control**
   Store owners should not manage flows unless they want to.

2. **Default to Safe Automation**
   Conservative messaging beats aggressive growth early.

3. **Explainability Builds Trust**
   Every AI action must be explainable in human language.

4. **Revenue Attribution First**
   If revenue can't be attributed, it doesn't count.

5. **Zero-Config by Default**
   Setup friction kills SMB adoption.

---

## 2. Problem Statement (Expanded with Insight)

### Root Causes (Not Just Symptoms)

| Symptom | Root Cause |
|---------|------------|
| Low conversion | No real-time personalization |
| Cart abandonment | No behavioral follow-up |
| Poor retention | One-size-fits-all post-purchase |
| Too many tools | Fragmented mental model |
| No time | SMBs can't be full-time marketers |

### Key Insight
SMBs don't lack tools — they lack **execution bandwidth**.

---

## 3. Target Customers & Personas (Expanded)

### Primary Persona: Store Owner (Core)

**Name:** Sarah  
**Store:** Shopify DTC brand  
**Revenue:** $30k/month  

**Pain Points:**
- "I know email works, but I never set it up right"
- "I don't know what message to send or when"  
- "I just want more orders"

**Success Definition:** "I installed it and sales went up."

### Secondary Persona: Operator (Light Power User)

**Goals:**
- Understand AI actions
- Override when necessary
- View performance quickly

### Anti-Persona (Important)
❌ Enterprise e-commerce teams  
❌ Marketing automation experts  
❌ Agencies demanding full customization (V1)

---

## 4. Goals & Success Metrics (Refined)

### North Star Metric (Refined)
**Incremental Revenue Lift Attributed to AI per Store per Month**

*Why:* Filters out baseline sales, aligns pricing fairness, prevents vanity metrics

### Metric Hierarchy

**Primary:**
- Incremental recovered revenue ($)

**Secondary:**
- Time to first recovered order
- Revenue per recipient
- Campaign-level conversion rate

**Guardrail:**
- Unsubscribe rate
- Spam complaint rate
- Email deliverability score

---

## 5. Product Scope (V1) – Expanded Detail

### In Scope (V1 – Must Have)

#### 5.1 Shopify Data Model (Detailed)

**Entities:**
- Store (Tenant)
- Customer
- Product
- Variant
- Order
- Checkout
- Event

**Event Types:**
- product_view
- add_to_cart
- checkout_started
- purchase_completed
- email_clicked
- email_opened

#### 5.2 AI Agent Architecture (Critical)

**High-Level Components:**
1. Event Listener
2. Context Builder
3. Decision Engine
4. Content Generator
5. Execution Engine
6. Learning Loop

**Flow:** Event → Context → Decision → Content → Send → Measure → Learn

---

## 6. AI Agent Decision Logic (Deep Dive)

### Decision Inputs (Expanded)

| Category | Examples |
|----------|----------|
| Behavior | views, recency, frequency |
| Product | price, category, margin |
| Customer | new vs returning |
| Store | brand tone, discount policy |
| System | frequency cap, fatigue score |

### Decision Outputs
- Should we message? (Yes / No)
- Which campaign?
- When?
- Which channel? (Email only in V1)
- Which content variant?

### Frequency & Fatigue Model

**Rules:**
- Max 1 message / 24h
- Max 3 messages / 7 days
- Cooldown after conversion
- Hard stop on unsubscribe

---

## 7. Content Generation System (Detailed)

### Content Layers
1. Structural Template
2. AI-Created Copy
3. Dynamic Variables

### Personalization Variables
- customer_first_name
- product_name
- product_image
- price
- cart_summary
- discount_code
- urgency_reason

### Brand Voice System
Store owner selects:
- Friendly
- Premium
- Playful
- Minimal

AI adapts tone accordingly.

---

## 8. Campaign Logic (Expanded)

### V1 Campaign Matrix

| Campaign | Trigger | Delay | Goal |
|----------|---------|-------|------|
| Browse Abandonment | Product viewed | 1–4 hrs | Return visit |
| Cart Abandonment | Cart created | 1–24 hrs | Checkout |
| Checkout Abandonment | Checkout | 1–12 hrs | Purchase |
| Post-Purchase | Order completed | Instant | Trust |
| Repeat Purchase | X days | 14–60 days | LTV |

---

## 9. Dashboard & UX (Expanded)

### Dashboard Philosophy
"I don't want to manage — I want to understand."

### Core Screens (V1)

**Overview:**
- Revenue recovered
- ROI
- Messages sent

**AI Activity Feed:**
- "Sent email to John because…"
- "Paused campaign due to fatigue"

**Campaign Performance:**
- Simple per-flow stats

**Controls:**
- Pause AI
- Set frequency caps
- Edit brand tone

---

## 10. Attribution Model (Critical)

### Revenue Attribution Rules
- Last AI-touch attribution
- Conversion window: 7 days
- Control group (future)

---

## 11. Onboarding Flow (Refined)

1. Install Shopify App
2. OAuth store access
3. Auto-sync data
4. Brand voice preview
5. "AI is live" confirmation
6. First recovered sale notification

---

## 12. Non-Functional Requirements (Expanded)

### Reliability
- At-least-once event processing
- Idempotent message sending

### Observability
- Event logs
- AI decision logs
- Email delivery logs

---

## 13. Risk Management (Expanded)

| Risk | Mitigation |
|------|------------|
| AI hallucinations | Strict templates |
| Wrong timing | Conservative defaults |
| Deliverability | Dedicated IP warm-up |
| Regulatory | Auto-unsubscribe handling |

---

## 14. Pricing & Billing (Expanded)

### Billing Mechanics
- Monthly base fee
- % fee calculated daily
- Revenue cap (future)

---

## 15. Competitive Differentiation

| Tool | Dashboard | Automation | AI Autonomy |
|------|-----------|------------|-------------|
| Klaviyo | ✅ | ⚠️ | ❌ |
| Mailchimp | ✅ | ❌ | ❌ |
| Your Product | ❌ | ✅ | ✅ |

---

## 16. MVP Exit Criteria (Very Important)

V1 is successful if:

- 70% of beta stores recover ≥1 order
- Median time to first recovered sale < 48h
- Churn < 15% after 90 days

---

## 17. Final PM Judgment

This PRD is:
- ✅ Buildable
- ✅ Focused
- ✅ Revenue-aligned
- ✅ Startup-realistic

### The Biggest Strength
You are building an **autonomous revenue employee**, not a tool.

---

## Next Steps Available

I can help you with:
- System architecture & service boundaries
- Database schema (multi-tenant, Shopify-safe)
- AI decision pseudo-code
- Event → message timing algorithm
- Shopify App Store approval pitfalls
- Go-to-market MVP experiment plan

Just tell me which one you want next.