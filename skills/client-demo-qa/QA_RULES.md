# QA Hard Rules — Never Violate

## Communication — NEVER in QA tests
- NEVER call real phone numbers (use 5550000000)
- NEVER send real SMS (use fake numbers)  
- NEVER send real emails (use test+TIMESTAMP@test.com)
- NEVER use client's number in automated tests
- NEVER use CRM customer numbers in automated tests

Real communication = ONLY when user manually triggers from demo UI

## Safe test values
- Phone: 5550000000
- Email: test1234@test.com
- Name: QA Test
- Address: 123 Test St Austin TX 78701

## Voice QA — safe approach
- Check SANDBOX_MODE via /health/deep — do NOT place real calls in QA
- Verify voice endpoint accepts payload and returns success shape
- Never loop voice calls — one manual test only
