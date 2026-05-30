# 🏋️‍♂️ IronPulse Fitness - Premium Fitness Landing Page

IronPulse Fitness is a state-of-the-art, fully responsive fitness landing page designed to attract, engage, and convert potential gym members. It features modern animations, interactive widgets, and a cohesive design system using **Tailwind CSS**, **Bootstrap components**, and **Vanilla Javascript**.

---

## ✨ Features

- **📱 Fully Responsive Design**: Seamless layout across mobile (320px+), tablet, and desktop viewports.
- **🧮 Interactive BMI Health Calculator**: Calculates Body Mass Index in both **Metric** (kg/cm) and **Imperial** (lbs/inches) systems, updating a visual gauge bar and providing personalized workout recommendations.
- **📅 Weekly Timetable Schedule**: Filterable weekly class schedule by day (Mon-Sat) and fitness disciplines (Strength, HIIT, Yoga, Zumba) using fast, local DOM filtering.
- **👥 Class Booking System**: Interactive slot reservation system with overlay modals, custom forms, and Bootstrap Toast notifications for feedback.
- **✨ Before/After Transformation Slider**: Custom interactive clip-path image comparison slider, allowing users to drag and compare results.
- **🖼️ Photo Gallery & Lightbox Modal**: Modern grid showing gym facilities with a responsive lightbox viewer supporting image carousel (next/prev) controls and keyboard shortcuts (`Escape`, `ArrowLeft`, `ArrowRight`).
- **💬 Testimonials Slider**: Auto-sliding success stories with manual dot navigation and hover-pause capability.
- **🏎️ Infinite Marquee Ticker**: Smooth, CSS-animated loop displaying trusted partner brands.
- **📨 Contact Form**: Frontend form validation with error state UI indicators.

---

## 📂 Project Directory Structure

The project has been refactored into a clean, modern, and standard structure for clean code maintenance:

```text
gym/
├── assets/
│   ├── css/
│   │   └── style.css      # Core animations, custom overlays, and theme overrides
│   └── js/
│       └── script.js      # Slider, calculator, schedule filters, lightbox, and modals
├── index.html             # Main entrypoint and semantic HTML structure
├── vercel.json            # Vercel routing and cache optimization configurations
├── .gitignore             # Git exclusion rules for vscode and OS clutter
└── README.md              # Project documentation
```

---

## 🛠️ Technologies Used

- **HTML5**: Semantic tags structure.
- **Tailwind CSS**: Utility-first CSS framework for visual layouts.
- **Bootstrap 5 (CSS/JS)**: Grid structure assistance, accordion, and Toast component elements.
- **Font Awesome 6**: Rich iconography.
- **Google Fonts (Inter & Outfit)**: Custom typography.
- **JavaScript (ES6+)**: Smooth micro-interactions, sliders, and calculator logic.

---

## 🚀 Getting Started

### Prerequisites

To view the project locally, you only need a modern web browser.

### Local Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/gym-project.git
   cd gym-project
   ```

2. **Run a local server**:
   You can run it using any simple local server. For example, using VS Code **Live Server** extension, or via CLI:
   - **Using Node.js (`http-server`)**:
     ```bash
     npx http-server .
     ```
   - **Using Python**:
     ```bash
     python -m http.server 8000
     ```

3. Open `http://localhost:8000` (or the port specified by your local server) in your browser.

---

## ☁️ Deployment to Vercel

The project is pre-configured and fully ready for one-click Vercel deployments!

### Method 1: Via Vercel Dashboard (Recommended)

1. Push your project to a GitHub repository.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and log in.
3. Click **Add New** -> **Project**.
4. Import your GitHub repository.
5. Vercel will automatically detect the static project type. Leave the default build settings as-is.
6. Click **Deploy**.

### Method 2: Via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command inside the project root:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to deploy. To deploy to production:
   ```bash
   vercel --prod
   ```

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
