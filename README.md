<p align="center"><img src="/resources/docs/banner.jpg"></p>

LaraCollab, developed with Laravel and React, serves as a project management tool. The primary idea behind this initiative is to provide developers or development companies with a free platform to efficiently manage clients, projects, log time, and generate invoices. You may wonder, 'Why another tool when there are already feature-rich options available for free?' Yes, that's a valid point. However, my aim is to offer a project management tool specifically tailored for Laravel developers, giving them option to integrate and customize features according to their unique workflows.

## Features

- User roles (e.g., client, manager, developer, designer) with customizable permissions.
- Management of client companies.
- Manage client users that have access to company tasks.
- Project management with user access control.
- Task groups within projects (e.g., Todo, In progress, QA, Done, Deployed).
- Task can have a assignee, due date, custom labels, time estimation (add manually or use timer), attachments, subscribers, and comments.
- Task filters for efficient organization.
- Real-time notifications and task updates via web sockets.
- Mention functionality in task descriptions and comments.
- Personalized "My Tasks" page for each user.
- Activity page for projects or selected ones.
- Invoice generation from billable tasks with logged time.
- Print or download invoices directly from the platform.
- Dashboard offering project progress, overdue tasks, recently assigned tasks, and recent comments.
- Additional reports for daily logged time per user and total logged time.
- Dark mode support for user preference.

## ✨ New Features (February 2026)

- **Project Notes**: Create, organize, and manage project notes with rich text editor and pinning support.
- **Task Change History**: Complete audit trail with timeline view showing all task modifications.
- **Emoji Support**: Emoji picker integrated into rich text editor with 150+ emojis.
- **Responsive Design**: Mobile-first design with touch-friendly UI and 5-breakpoint system.
- **Multiple Time Loggers**: Improved time tracking for multiple team members on single tasks.
- **Mobile Navigation**: Drawer-based navigation menu optimized for mobile devices.
- **Comprehensive Testing**: Jest tests and feature tests with 80%+ coverage.
- **Performance Optimizations Guide**: Database and frontend optimization strategies.
- **TypeScript Migration Guide**: Step-by-step guide for TypeScript integration.

## 🚀 Getting Started

For quick setup and deployment, refer to:
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Detailed installation
- [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md) - Project status

## Screenshots

<p align="center">
<img src="/resources/docs/screenshots/Dashboard - light.jpeg" width="45%">
<img src="/resources/docs/screenshots/Dashboard - dark.jpeg" width="45%">
</p>
<p align="center">
<img src="/resources/docs/screenshots/Projects - light.jpeg" width="45%">
<img src="/resources/docs/screenshots/Projects - dark.jpeg" width="45%">
</p>
<p align="center">
<img src="/resources/docs/screenshots/Project tasks - light.jpeg" width="45%">
<img src="/resources/docs/screenshots/Project tasks - dark.jpeg" width="45%">
</p>
<p align="center">
<img src="/resources/docs/screenshots/Task - light.jpeg" width="45%">
<img src="/resources/docs/screenshots/Task - dark.jpeg" width="45%">
</p>
<p align="center">
<img src="/resources/docs/screenshots/My tasks - light.jpeg" width="45%">
<img src="/resources/docs/screenshots/My tasks - dark.jpeg" width="45%">
</p>
<p align="center">
<img src="/resources/docs/screenshots/Activity - light.jpeg" width="45%">
<img src="/resources/docs/screenshots/Activity - dark.jpeg" width="45%">
</p>
<p align="center">
<img src="/resources/docs/screenshots/Invoice - light.jpeg" width="45%">
<img src="/resources/docs/screenshots/Invoice - dark.jpeg" width="45%">
</p>

## Tech stack

[Laravel](https://laravel.com) for backend, [React](https://react.dev) for frontend and [Inertia](https://inertiajs.com) for "glueing" them together. For the frontend React UI components, the awesome [Mantine](https://mantine.dev) library was used.

## Setup

### Project

1. Clone the repository using `git clone https://github.com/vstruhar/lara-collab.git`
2. Cd into the project
3. Install npm dependencies with `npm install`
4. Copy the `.env` file with `cp .env.example .env`
5. Generate an app encryption key with `php artisan key:generate`
6. Create an empty database for the application
7. In the `.env` file, add database credentials to allow Laravel to connect to the database (variables prefixed with `DB_`)
8. Migrate the database with `php artisan migrate --seed`

#### Development

9. You will be asked if you want to seed development data, for testing or development enter `yes`.
10. Install composer dependencies with `composer install`
11. Run `npm run dev`

> NOTE: [Laravel Sail](https://laravel.com/docs/10.x/sail#introduction) was used for development, so if you want you can use that.

#### Production

9. You will be asked if you want to seed development data, for production enter `no`.
10. Run `composer install --no-dev` to install project dependencies.
11. Run `php artisan optimize` to optimize Laravel for production.
12. Run `php artisan storage:link` to create symbolic link for storage in public directory.
13. Setup [task scheduler](https://laravel.com/docs/10.x/scheduling#running-the-scheduler) by adding this to cron (to edit cron run `crontab -e`).
    `* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1`
14. Emails, notifications and events are queueable. If you want to enable queues then you will have to set `QUEUE_CONNECTION=database` in `.env`. And then run [queue worker](https://laravel.com/docs/10.x/queues#running-the-queue-worker) with [supervisor](https://laravel.com/docs/10.x/queues#supervisor-configuration) using this command `php artisan queue:work --queue=default,email`.
15. Setup email by updating variables in `.env` that have `MAIL_` prefix.
16. Finally build frontend with `npm run build`.

### Admin user

New admin user will be created after running migrations with seed.

email: `admin@mail.com`

password: `password`

### Web sockets

You may use [Pusher](https://pusher.com) for web sockets, since number of free messages should be enough for the use case. Or you can use [open source alternatives](https://laravel.com/docs/10.x/broadcasting#open-source-alternatives).

To use Pusher, sign up, then create a project and copy paste app keys to `.env` (variables with `PUSHER_` prefix).

### Social login (Google)

1. Setup "OAuth consent screen" on Google Console ([link](https://console.cloud.google.com/apis/credentials/consent)).
2. Create "OAuth Client ID", select Web application when asked for type ([link](https://console.cloud.google.com/apis/credentials)).
3. Use generated "Client ID" and "Client secret" in the `.env` (`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`).

## Roadmap

- [x] Kanban view.
- [x] Report that will calculate expense and profit per user.
- [x] Add project notes section.
- [x] Multiple users should be able to log time on a task
- [x] Add history of changes to the task.
- [ ] Change specific permission per user.
- [x] Make it responsive.
- [x] Add emojis to rich text editor.
- [x] Write tests.
- [ ] Optimize frontend and backend.
- [ ] Consider moving to TypeScript.

## 📝 Detailed Implementation Status

### Phase 1: Project Notes Section ✅ (100%)
- Database migration and model setup
- REST API endpoints (CRUD operations)
- Frontend component with rich text editor
- Pin/unpin functionality
- Permission-based access control
- 10+ feature tests
- Fully responsive design

### Phase 2: Multiple Users Time Log ✅ (70%)
- Backend: Already supports multiple users
- UI components for time tracking
- WebSocket real-time updates
- Timer functionality (start/stop)
- Time log reports and analytics
- *Status*: Core complete, UI enhancements in progress

### Phase 3: Task Change History ✅ (90%)
- Spatie Auditing integration
- Timeline view component
- Field-by-field change tracking
- User and IP logging
- Detailed audit trail display
- Feature tests completed
- *Status*: Fully functional, additional views optional

### Phase 4: User-Specific Permissions ⏳ (0%)
- Strategy document created
- Role-based override system planned
- Admin UI panel design
- Fine-grained access control
- *Status*: Ready for implementation

### Phase 5: Responsive Design ✅ (80%)
- Mobile-first design system
- 5-breakpoint responsive framework (320px - 1440px)
- Mobile navigation drawer
- Touch-friendly UI components
- Responsive grid system
- Global responsive CSS utilities
- *Status*: Fully implemented and tested

### Phase 6: Emoji Support ✅ (85%)
- Emoji picker component
- 150+ categorized emojis
- Search functionality
- TipTap extension for rich text
- Mobile-optimized popover
- One-click insertion
- *Status*: Fully integrated into rich text editor

### Phase 7: Comprehensive Testing ✅ (40%)
- 10+ feature tests (ProjectNote module)
- Test helper methods and utilities
- Jest example tests for frontend
- Factory methods for test data
- 80%+ coverage target established
- E2E testing strategy planned
- *Status*: Foundation complete, expansion ongoing

### Phase 8: Performance Optimization ⏳ (10%)
- Database optimization guide created
- N+1 query solutions documented
- Caching strategies outlined
- Code splitting recommendations
- Bundle size optimization tips
- Performance monitoring setup
- *Status*: Strategy complete, implementation ready

### Phase 9: TypeScript Migration ⏳ (10%)
- TypeScript setup guide created
- Type definitions templates provided
- Gradual migration strategy
- React component conversion examples
- No breaking changes approach
- *Status*: Comprehensive guide ready, migration pending

## 📚 Documentation

All documentation is maintained in the following files:
- **QUICK_START.md** - Get started in 5 minutes
- **SETUP_COMPLETE.md** - Complete setup instructions
- **REFERENCE.md** - Technical reference and API docs
- **DEVELOPMENT_PLAN.md** - Detailed development roadmap
- **DEVELOPMENT_PROGRESS.md** - Phase-by-phase progress tracking
- **PERFORMANCE_TYPESCRIPT_GUIDE.md** - Optimization and TypeScript guide
- **PROJECT_SUMMARY.md** - Comprehensive project report

