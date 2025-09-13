# Athlemics

Athlemics is a web application designed to help student-athletes organize their daily schedules, balancing study, training, tasks, and meetings. Built with React, it offers a clean and intuitive interface featuring a daily timeline, interactive calendar, personal statistics, and multilingual support.

## Website

[https://athlemics.pages.dev](https://athlemics.pages.dev)

## Features

- **Monthly Calendar**: Easily navigate between months and select specific days.
- **Daily Timeline**: Vertical day view with draggable time blocks.
- **Customizable Blocks**: Create blocks with title, description, time, and type (study, training, class, task, meeting).
- **Mark as Completed**: Track your progress throughout the day.
- **Summary Cards**:

  - Next upcoming blocks
  - Future tasks and meetings
  - Goals (to be implemented)

- **Profile Management**:

  - Store your name, course, email, and sport modality
  - Display statistics: total blocks, study/training hours, last activity

- **Multilingual Support**:

  - Switch languages via a simple dropdown
  - Recognizable flags for easier selection
  - Currently supports: Portuguese 🇵🇹, English 🇬🇧, Spanish 🇪🇸, French 🇫🇷, German 🇩🇪, Chinese 🇨🇳

## Technologies Used

- React
- Tailwind CSS (via utility classes in JSX)
- LocalStorage for data persistence
- react-i18next for translations

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/AfonsoFaria20s/Athlemics.git
   cd Athlemics
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Notes

- Translation files are located in `src/locales/` with a JSON structure for each language.
- The language selector is available in the **Account** page and applies across the whole application.
- Adding more languages is simple: create a new JSON file in `locales` and add an option in the dropdown.

This project is ideal for students and athletes looking to maintain a structured and productive daily routine while supporting multiple la
