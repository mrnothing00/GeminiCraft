# GeminiCraft 🛠️⚡️

> **The AI-Powered IoT Workbench.**
> Design visually, validate with AI, simulate logic, and flash directly to ESP32 - no Arduino IDE required.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Gemini 3](https://img.shields.io/badge/AI-Gemini%203-purple)
![Stack](https://img.shields.io/badge/tech-React%20|%20Vite%20|%20WebSerial-blue)

🔗 **Hackathon write-up:** [GeminiCraft on Devpost](https://devpost.com/software/geminisketch)

**GeminiCraft** is a visual IoT development platform that bridges the gap between napkin sketches and physical hardware. By leveraging **Google Gemini 3**, it allows developers to design circuits via a drag-and-drop canvas, validates GPIO safety in real-time, generates Arduino code, and **flashes firmware directly to ESP32 boards** using the browser's WebSerial API.

---

## 📖 Table of Contents

- [Why GeminiCraft?](#-why-geminicraft)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Why GeminiCraft?

Hardware development is unforgiving. A single misconnected wire can destroy expensive components like ESP32s. **GeminiCraft** solves the "Magic Smoke" problem by providing a safe, AI-assisted sandbox.

It combines **Computer Vision** (to recognize your sketches) with a **Hardware Simulation Engine** (to test logic) and **WebSerial** (to flash code), creating a friction-free workflow from concept to reality.

---

## ✨ Key Features

### 🎨 Visual Canvas & AI Recognition
- **Drag-and-Drop:** Intuitive interface for placing microcontrollers, sensors, and actuators.
- **Sketch-to-Circuit:** Draw a rough component (e.g., "Fan") and Gemini 3 identifies it, assigning correct pin definitions automatically.

### 🩺 The "Pin Doctor" (GPIO Validation)
- **AI Safety Check:** Gemini analyzes your wiring in real-time.
- **Error Prevention:** Automatically flags dangerous connections (e.g., connecting 5V to a 3.3V input or using an Input-only pin for Output) *before* you compile.

### ⚡ Virtual Simulator
Test your logic without hardware. We use a custom browser-based runtime with strict physics models:
- **Digital Logic:** $S_{pin} = 1 \text{ if } V_{in} \ge 0.7 \times V_{CC}$
- **Analog Accuracy:** $V_{out} = V_{in} \cdot \frac{R_2}{R_1 + R_2}$

### 🔌 Direct WebSerial Flashing
- **No Arduino IDE Needed:** Compile and upload firmware directly from Chrome or Edge.
- **One-Click Flash:** Seamlessly transfer the AI-generated code to your connected ESP32.

---

## 🧱 Tech Stack

| Component | Technology |
|:---|:---|
| **Frontend** | React + Vite |
| **AI Engine** | Google Gemini API (Multimodal Vision & Reasoning) |
| **Simulation** | Browser-based virtual runtime with discrete time-steps |
| **Hardware Bridge** | WebSerial API (Chrome / Edge) |
| **Target Hardware** | ESP32 (ESP-WROOM-32 and compatibles) |

---

## 📋 Prerequisites

Before you begin, ensure you have the following:

### Software
- **Node.js LTS** (v18+)
- **npm**, **pnpm**, or **yarn**
- **Google Chrome** or **Microsoft Edge** (Required for WebSerial support)

### Hardware (Optional but Recommended)
- ESP32 Development Board (e.g., ESP32-WROOM-32)
- USB Data Cable

### API Access
- A valid **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mrnothing00/GeminiCraft.git
    cd GeminiCraft
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    ```
    Add your API key:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```

---

## 🎮 Usage

1.  **Design:** Open the canvas and drag components or sketch them using the "AI Sketch" tool.
2.  **Verify:** Watch for "Pin Doctor" warnings. Ensure all connections are green.
3.  **Simulate:** Click **Run Simulation** to verify your logic (e.g., does the LED turn on when the button is pressed?).
4.  **Flash:**
    - Connect your ESP32 via USB.
    - Click **"Flash to Device"**.
    - Select your port in the browser popup.
    - Wait for the "Upload Complete" message.

---

