# Uber Clone - Full Stack Mobile Application

  A feature-rich Uber clone application built using **React Native** and **Expo**, designed to provide a seamless user experience with modern tools and technologies. From live location tracking and secure payments to ride history and responsive design.
  
---
## Table of Contents
- [Uber Clone - Full Stack Mobile Application](#uber-clone---full-stack-mobile-application)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Tech Stack](#tech-stack)
  - [Features](#features)
  - [Installation and Setup](#installation-and-setup)
    - [Prerequisites](#prerequisites)
    - [Cloning the Repository](#cloning-the-repository)
    - [Installing Dependencies](#installing-dependencies)
    - [Environment Variables](#environment-variables)
    - [Running the Project](#running-the-project)
  - [Showcase Video](#showcase-video)
---
## Overview

This **Uber Clone** application is a perfect blend of advanced functionality and clean UI/UX. Built with React Native for the user interface and styled with TailwindCSS, it integrates powerful tools like Google Maps for location-based services, Stripe for secure payments, and a serverless PostgreSQL database for data management.  

Whether you're searching for rides, tracking your location in real-time, or managing your ride history, this app is optimized for both Android and iOS platforms to deliver a responsive experience.  

---
## Tech Stack
This project leverages the following technologies:  
- **React Native**: For cross-platform mobile app development.  
- **Expo**: Streamlined development and deployment.  
- **Google Maps**: Rendering maps with live directions and location tracking.  
- **Stripe**: Secure and seamless payment integration.  
- **PostgreSQL**: Serverless database management.  
- **Zustand**: Lightweight state management.  
- **Clerk**: Authentication and user management.  
- **TailwindCSS**: For a modern, responsive design.  
---
## Features  
- **Onboarding Flow**: Smooth user registration and setup process.  
- **Email Password Authentication with Verification**: Secure login system with email verification.  
- **oAuth via Google**: Simplified login using Google accounts.  
- **Authorization**: Role-based secure access.  
- **Home Screen with Live Location & Google Maps**: Real-time location tracking and marker display.  
- **Recent Rides**: View a list of recent rides.  
- **Google Places Autocomplete**: Search places globally with autocomplete suggestions.  
- **Find Rides**: Enter 'From' and 'To' locations to search for rides.  
- **Select Rides from Map**: Pick available cars from a live map.  
- **Ride Confirmation**: View detailed ride information, including estimated time and fare.  
- **Stripe Payment Integration**: Pay securely using multiple methods.  
- **Create Rides After Payment**: Book rides instantly after successful payments.  
- **Profile Management**: Update and manage user account details.  
- **Ride History**: View a detailed history of all booked rides.  
- **Cross-Platform Responsiveness**: Optimized for Android and iOS devices.  

And much more, including reusable code architecture for scalability.  

---
## Installation and Setup
### Prerequisites  
Before setting up the project, ensure you have the following installed:  
- **Git**  
- **Node.js**  
- **npm** (Node Package Manager)  
### Cloning the Repository  
```bash  
git clone https://github.com/MarkoDavkovski/Uber-Clone.git  
cd uber  
```

### Installing Dependencies
Install the project dependencies:

```
npm install  
```

### Environment Variables
To configure the app, create a .env file in the root directory and include the following:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=  
EXPO_PUBLIC_SERVER_URL=  
EXPO_PUBLIC_GEOAPIFY_API_KEY=  
EXPO_PUBLIC_GOOGLE_API_KEY=  
EXPO_PUBLIC_STRIPE_PUBLISHABLE=  
STRIPE_SECRET_KEY=  
PORT=3050  
EXPO_PUBLIC_API_URL=  
```
Replace the placeholders with your actual credentials from Clerk, Stripe, NeonDB, Google Maps, and Geoapify.

### Running the Project
Start the application using Expo:

```
npx expo start
``` 

Download the Expo Go app on your device and scan the QR code to view the project on your phone.

---
## Showcase Video  

Here's a walkthrough video showcasing the application's features and flow:  

[![Watch the Video](https://via.placeholder.com/800x400?text=Application+Showcase+Video)](https://www.youtube.com/shorts/MbuYEHFWxus)

Click the thumbnail to watch the video.
