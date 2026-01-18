# Police Report Generator (Gerador de Boletins Policiais)

## Overview

A web application for generating standardized police report messages for WhatsApp distribution. The system is built for Brazilian Military Police units (CRPM Hortênsias region), allowing officers to fill structured forms and compile formatted messages compatible with WhatsApp's text formatting (using asterisks for bold).

The interface is entirely in Brazilian Portuguese (pt-BR). Reports include incident details, location, date/time in military format (DDHHMMMYY), involved parties (victims, perpetrators, witnesses), seized materials, and case summaries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS with custom professional blue/police theme
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod schema validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Type Safety**: Shared schemas between frontend and backend via @shared/ path alias

### Data Model
The core entity is a police report (`reports` table) containing:
- Incident type (fato), police unit, city
- Date/time stored as timestamp, formatted client-side to military format
- Location details
- Involved parties stored as JSONB array (role, name, criminal history, organized crime affiliation)
- Officer name, seized materials, case summary

### Key Design Patterns
- **Shared Types**: Schema definitions in shared/schema.ts used by both client and server
- **API Contract**: Routes defined with Zod schemas for input validation and response typing
- **Form-to-Message Compilation**: ReportFormatter component transforms form data into WhatsApp-compatible formatted text
- **Dependent Dropdowns**: City options depend on selected police unit (conditional field logic)

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via DATABASE_URL environment variable
- **Drizzle Kit**: Database migrations stored in /migrations directory

### UI Libraries
- **Radix UI**: Full suite of accessible primitives (dialogs, selects, forms, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date formatting with Portuguese locale support
- **embla-carousel-react**: Carousel functionality
- **vaul**: Drawer component
- **cmdk**: Command palette component
- **react-day-picker**: Calendar/date picker

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator