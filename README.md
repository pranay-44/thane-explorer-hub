# Thane Explorer Hub

THANE CONNECT — WEBSITE DEVELOPMENT INSTRUCTIONS

1. Project Overview

Build a complete, production-ready full-stack web application called "Thane Connect".

Thane Connect is a hyper-local community discovery portal where SP College students can publish and explore places in Thane City, including:

Food & Dining

Lakes & Nature

Temples & Heritage

Parks & Leisure

Historical Sites

Other Attractions

The platform must allow visitors to explore posts and allow authenticated student contributors to create, edit, and delete their own posts.

The website must follow the provided Thane Connect PRD as the primary source of truth.

2. Technology Stack

Use exactly this technology stack unless there is a strong technical reason otherwise:

Frontend

HTML5

Tailwind CSS

Vanilla JavaScript

Responsive/mobile-first design

Backend

Node.js

Express.js

Database

SQLite3 for development

Keep the database layer structured so it can later be migrated to PostgreSQL

Authentication

express-session

bcrypt

File Upload

Multer

Security

Helmet

XSS protection/sanitization

CSRF protection

Rate limiting

Server

Node.js + Express

PM2 for production

Nginx reverse proxy

Do NOT introduce React, Next.js, Vue, Angular, Firebase, MongoDB, or other frameworks unless explicitly requested.

3. Project Architecture

Use a clean, modular folder structure.

Recommended structure:

thane-connect/
│
├── server.js
├── package.json
├── .env
├── .gitignore
│
├── database/
│   ├── database.js
│   ├── schema.sql
│   └── seed.js
│
├── middleware/
│   ├── auth.js
│   ├── admin.js
│   ├── upload.js
│   └── validation.js
│
├── routes/
│   ├── auth.js
│   ├── posts.js
│   └── admin.js
│
├── controllers/
│   ├── authController.js
│   ├── postController.js
│   └── adminController.js
│
├── public/
│   ├── index.html
│   ├── explore.html
│   ├── login.html
│   ├── signup.html
│   ├── create.html
│   ├── dashboard.html
│   │
│   ├── post/
│   │   └── index.html
│   │
│   ├── edit/
│   │   └── index.html
│   │
│   ├── admin/
│   │   ├── dashboard.html
│   │   └── moderation.html
│   │
│   ├── css/
│   │   └── styles.css
│   │
│   ├── js/
│   │   ├── common.js
│   │   ├── auth.js
│   │   ├── explore.js
│   │   ├── post.js
│   │   ├── create.js
│   │   ├── dashboard.js
│   │   └── admin.js
│   │
│   └── uploads/
│
└── README.md


Keep frontend logic, backend logic, database logic, middleware, and routes separated.

4. Design Direction

Create a modern, clean and visually attractive website inspired by the identity of Thane.

The design should feel:

Local

Modern

Trustworthy

Student-friendly

Community-oriented

Travel/discovery focused

Use a strong visual hierarchy and large photography.

Avoid making the website look like a generic admin dashboard or basic college project.

5. Color & Visual System

Create a consistent design system.

Use:

Deep blue/navy for primary branding

White/light neutral backgrounds

Green or teal accents representing nature and lakes

Warm accent colors for food/cultural categories

Dark text for readability

Do not use excessive gradients.

Use rounded cards, subtle shadows, clean spacing and modern typography.

Create category-specific visual badges.

Example:

Food & Dining       → warm accent
Lakes & Nature      → teal/green
Temples & Heritage  → warm/orange
Parks & Leisure     → green
Historical Sites    → brown/gold
Other Attractions   → blue/gray


Maintain WCAG-friendly text contrast.

6. Global Navigation

Create a reusable responsive navigation bar.

Desktop:

THANE CONNECT

Home | Explore | My Posts | Login | Sign Up


When logged in:

THANE CONNECT

Home | Explore | My Posts | Create Post | Logout


Admin users should additionally see:

Admin


On mobile, convert the navigation into a hamburger menu.

The navbar must remain visually consistent across all pages.

7. Homepage

Create:

/index.html

Hero Section

Use a large high-quality Thane/Thane skyline/lake background image.

Headline:

Discover Thane Through Student Eyes

Supporting text should explain that Thane Connect allows students to discover local food, heritage, nature and attractions.

Primary CTA:

Explore Spots

Secondary CTA:

Join the Community

The hero should be visually impressive and responsive.

Cultural Legacy Section

Create a timeline or visually engaging historical section covering:

Ancient Shreesthanak roots

Maratha capture of Thane Fort in 1739

India's first passenger train terminus on April 16, 1853

Thane's lakes and natural attractions

Do not overload this section with text.

Use cards/timeline elements.

Featured Posts

Display the latest 6 posts.

Each card should contain:

Cover image

Category badge

Place name/title

Student author

Short description

Read More button

Use a responsive grid.

Desktop:

[ Card ][ Card ][ Card ]
[ Card ][ Card ][ Card ]


Tablet:

[ Card ][ Card ]
[ Card ][ Card ]


Mobile:

[ Card ]
[ Card ]


8. Explore Page

Create:

/explore.html

This is the main discovery page.

At the top:

Search

Add a prominent search bar:

Search places, food, lakes, heritage...


Search should work using post title and keywords.

Category Filter

Create a sticky filter bar:

All
Food & Dining
Lakes & Nature
Temples & Heritage
Parks & Leisure
Historical Sites
Other Attractions


Clicking a category should dynamically filter posts without unnecessarily reloading the page.

Post Grid

Desktop:

3 columns

Tablet:

2 columns

Mobile:

1 column

Each card:

[IMAGE]

CATEGORY

PLACE NAME

By Student Name

Short description...

[Read More]


Load 12 posts per page.

Implement pagination.

9. Authentication

Create:

/signup.html

/login.html

Signup

Fields:

Username

Password

Confirm Password

Display Name

College Name

Department

Username requirements:

4–20 characters

Alphanumeric

Unique

Password:

Minimum 8 characters

At least 1 uppercase character

At least 1 number

Provide real-time validation.

Show errors directly below the relevant field.

Do not allow submission until the form is valid.

After successful registration:

Sign up successful! Please log in with your credentials.


Redirect to login.

10. Login

Fields:

Username

Password

Authenticate against the database.

On successful login:

Redirect → /explore.html


Use server-side sessions.

Never store plain-text passwords.

Passwords must be hashed using bcrypt.

Use:

httpOnly cookies

secure cookies in production

sameSite=strict

11. Post Details

Create:

/post/:id

This page requires authentication.

If the user is not authenticated:

Redirect → /login.html


Display:

Large cover image

Category

Title

Publication date

Student name

College

Department

Full description

Google Maps button

Example:

[ LARGE IMAGE ]

FOOD & DINING

Raymond's Café

By Ansh Sharma
SP College • IT

--------------------------------

Full review...

--------------------------------

[ Open in Google Maps ]


If the logged-in user owns the post:

[ Edit Post ] [ Delete Post ]


Delete must require confirmation.

12. Create Post

Create:

/create.html

Authentication required.

Form:

Title

Maximum 100 characters.

Category

Dropdown containing all six categories.

Google Maps URL

Validate that the submitted URL is a valid Google Maps link.

Cover Image

Allowed:

PNG

JPEG

WebP

Maximum upload size:

5 MB.

Show image preview before publishing.

Description

Minimum:

50 characters

Maximum:

2000 characters

Support basic Markdown:

Bold

Italic

Links

Student information

Automatically populate:

Student Name

College

Department

These fields must be read-only.

13. Publishing Flow

When the student clicks Publish:

Validate all fields on frontend.

Send request to backend.

Validate everything again server-side.

Validate image MIME type and file signature.

Compress/convert image to WebP where possible.

Store image.

Insert post into database.

Associate post with logged-in user's ID.

Return created post ID.

Redirect to post details.

Display:

Post published! View your post.


Posts should publish immediately; there is no contributor approval queue.

14. Edit Post

Create:

/edit/:id

Only the owner of the post can edit it.

Pre-populate all existing information.

Allow the user to modify:

Title

Category

Location

Image

Description

Do not allow users to modify:

Author ID

Student name

College

Department

Those values must come from the authenticated session/database.

15. My Posts Dashboard

Create:

/dashboard.html

Display the logged-in student's posts.

Example:

My Posts

[ Create New Post ]

--------------------------------

Raymond's Café
Food & Dining
Published: Aug 9, 2026

[View] [Edit] [Delete]

--------------------------------


Include:

Total posts

Recent posts

Edit actions

Delete actions

Create Post button

16. Admin System

Create:

/admin/dashboard.html
/admin/moderation.html


Only users with:

role = admin


can access these pages.

Admin Dashboard

Display:

Total posts

Total users

Active contributors

Posts by category

Recent posts

Recent users

Use simple charts/visualizations with vanilla JavaScript if appropriate.

17. Admin Moderation

Admin can:

View all posts

Delete any post

View users

Disable users

Reactivate users if needed

Before destructive actions, show confirmation dialogs.

Admin should never be able to accidentally delete something with a single click.

18. Database

Use SQLite3 during development.

Create:

users

id
username
password_hash
display_name
college_name
department_name
role
is_active
created_at


posts

id
title
category
location_url
image_url
description
author_id
author_name
author_college
author_department
created_at


Implement the foreign-key relationship between:

posts.author_id → users.id


Create indexes for:

category
created_at
author_id


Structure the database layer so it can later migrate to PostgreSQL.

19. API

Implement the following API structure.

Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/check


Posts

GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id


Static uploads

GET /public/uploads/:filename


Use proper HTTP status codes.

Example:

200 → success
201 → created
400 → validation error
401 → unauthenticated
403 → unauthorized
404 → not found
409 → conflict
500 → server error


Return consistent JSON responses.

Example:

{
  "success": true,
  "message": "Post created successfully",
  "data": {}
}


20. Security Requirements

Security is mandatory.

Implement:

Password Security

Use bcrypt with at least 10 rounds.

XSS

Sanitize user-generated content.

Never directly inject unsanitized user content into HTML.

CSRF

Implement CSRF protection for state-changing requests.

Rate Limiting

Limit POST requests to approximately:

10 requests/minute/IP


File Upload Security

Validate:

Extension

MIME type

File signature/magic bytes

File size

Maximum:

5 MB


Prevent:

Path traversal

Executable uploads

Malicious filenames

Generate safe unique filenames.

Sessions

Use secure server-side sessions.

Do not store authentication information in localStorage.

21. Image Optimization

Images are important to the website's performance.

When an image is uploaded:

Validate it.

Resize if necessary.

Convert to WebP.

Compress it.

Target approximately 200KB maximum where practical.

Store optimized image.

Use lazy loading for images below the fold.

Example:

<img loading="lazy" ...>


Use responsive image dimensions.

22. Performance

Target:

Page load < 1.2 seconds

Post publication latency < 1 second

Optimize by:

Minifying CSS/JS where appropriate

Compressing images

Lazy loading images

Avoiding unnecessary JavaScript

Pagination

Database indexes

Efficient API queries

Browser caching for static assets

Do not load huge libraries unnecessarily.

23. Responsive Design

Use mobile-first design.

Support:

Mobile

Tablet

Laptop

Desktop

The website must work properly on:

Android Chrome

iOS Safari

Desktop Chrome

Edge

Firefox

Interactive controls should have at least approximately 44×44px touch targets.

Never allow horizontal scrolling on normal pages.

24. UX Requirements

Every interaction should provide clear feedback.

Examples:

Loading:

Loading places...


Success:

Post published successfully!


Error:

Something went wrong. Please try again.


Empty search:

No places found.
Try another search or category.


Delete:

Are you sure you want to delete this post?
This action cannot be undone.


Use toast notifications where appropriate.

Avoid browser-default alert boxes unless necessary.

25. Accessibility

Implement:

Semantic HTML

Proper heading hierarchy

Labels for inputs

Keyboard navigation

Focus states

Alt text for images

Accessible buttons

Sufficient color contrast

ARIA labels where appropriate

Do not rely solely on color to communicate status.

26. Error Handling

Handle:

Invalid login

Duplicate username

Invalid image

Oversized image

Missing fields

Invalid Google Maps URL

Unauthorized post editing

Unauthorized deletion

Expired sessions

Database errors

Network errors

Missing post IDs

Disabled accounts

Never expose raw database errors or stack traces to users.

Log detailed errors on the server instead.

27. Seed Data

Create a database seed script for development.

Include:

One admin account

Several sample student accounts

At least 10 sample posts

Use realistic Thane-related sample locations.

Clearly mark seed credentials as development-only.

Do not use real people's personal information.

28. Development Workflow

Build the project in this order:

Phase 1 — Foundation

Initialize Node project

Install dependencies

Create Express server

Create folder structure

Configure environment variables

Phase 2 — Database

Create SQLite database

Create tables

Add indexes

Add seed data

Test CRUD operations

Phase 3 — Authentication

Registration

Login

Logout

Sessions

Authentication middleware

Admin middleware

Phase 4 — Backend API

Post CRUD

Search

Category filtering

Pagination

Image upload

Phase 5 — Frontend

Global navbar/footer

Homepage

Explore

Login

Signup

Post details

Create post

Edit post

Dashboard

Phase 6 — Admin

Admin dashboard

Analytics

User management

Content moderation

Phase 7 — Security

Helmet

CSRF

XSS sanitization

Rate limiting

File validation

Session security

Phase 8 — Performance

Image optimization

Lazy loading

Pagination

Caching

Minification

Phase 9 — Testing

Test every user flow.

Phase 10 — Deployment

Prepare the application for:

Node.js
PM2
Nginx
HTTPS


29. Important Development Rule

Do NOT attempt to build the entire project in one giant file.

Keep:

HTML

CSS

JavaScript

API routes

Controllers

Middleware

Database

separated and maintainable.

Use reusable frontend components/functions for:

Navbar

Footer

Post cards

Toast notifications

Authentication checks

API requests

Category badges

30. Testing Checklist

Before declaring the project complete, test:

Visitor

Homepage loads

Explore loads

Search works

Category filters work

Pagination works

Visitor cannot access protected post details without login

Student

Signup works

Duplicate username rejected

Login works

Logout works

Create post works

Image upload works

Image validation works

Post appears immediately

Edit own post works

Cannot edit another user's post

Delete own post works

Dashboard works

Admin

Admin can log in

Admin dashboard works

Admin can view analytics

Admin can delete any post

Admin can disable users

Normal students cannot access admin pages

Security

Passwords are never stored plaintext

Unauthorized API requests are rejected

XSS payloads are sanitized

Invalid uploads are rejected

Oversized uploads are rejected

CSRF protection works

Rate limiting works

Session cookies are secure in production

Responsive

Test at:

375px
768px
1024px
1440px


31. Final Quality Standard

The finished website should look and feel like a real community discovery platform, not a basic college CRUD project.

Prioritize:

Clean UI

Excellent mobile experience

Fast performance

Secure authentication

Simple navigation

High-quality photography

Strong typography

Good spacing

Clear user feedback

Maintainable code

Follow the PRD strictly. Do not remove required functionality.

If a technical implementation detail is not explicitly specified, choose the simplest maintainable solution that fits the existing architecture rather than introducing unnecessary technologies.

Before finishing, verify that every page, API endpoint, database operation, authentication rule, permission rule, and security requirement in the PRD has been implemented and tested.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/19772d1e-deaa-4df7-a8b2-02a8d1ff17c4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
