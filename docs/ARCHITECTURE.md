# Architecture

The platform uses a modular monorepo with independently deployable frontend, API, and AI inference services.

1. Citizens submit to the versioned API.
2. The API persists the complaint as `submitted`, uploads validated attachments, and calls the AI service.
3. AI returns department/category, priority, similarity matches, explanation, and review flag.
4. Backend writes immutable prediction and timeline records, routes high-confidence tickets, and emits Socket.IO events.
5. Officers work only tickets authorized by department scope. Review officers can override predictions with an audited reason.
6. Resolution requires a citizen confirmation window; citizens can reopen or provide feedback.

MongoDB indexes support ticket lookup, department queues, status/priority filters, and time-series analytics. External messaging and ERP adapters should implement the interfaces in `backend/src/services/integrations` as providers are enabled.
