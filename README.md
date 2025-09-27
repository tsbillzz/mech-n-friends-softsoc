# Sydney PC Finder

This is a Next.js application designed to help University of Sydney students find available computers on campus. It provides a real-time map view of university buildings, detailed layouts of computer labs, and powerful filtering options to find the perfect study spot.

## For Hackathon Judges

Welcome! This app provides a streamlined experience for finding available PCs across the University of Sydney campus.

### How to Use the App

1.  **Open the website:** You'll be greeted with a map of the campus.
2.  **Find a PC:** Click the top-right button (with the sliders icon) to open the "Find a PC" filter.
3.  **Set Your Criteria:**
    *   **Building (Optional):** Choose a specific building, or leave it as "Any building" to find the closest option to you.
    *   **Software:** Select any specific software you need (e.g., Adobe Photoshop, MATLAB).
    *   **Group Study:** Enable the "Group Study Finder" to locate clusters of 2 or more available PCs next to each other.
4.  **Click "Find PC":**
    *   If you selected a building, the map will pan to it and highlight it.
    *   If you left it as "Any building," the app will use your browser's location to find the *nearest* building that matches your criteria and highlight it on the map.
5.  **Explore Buildings:** Click on any building on the map at any time to see a detailed view of all its available computers.

---

## Getting Started Locally

To run this project on your local machine, you'll need to follow these steps.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- A package manager like `npm` or `yarn`

### 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### 3. Setup Google Maps API Key

This project requires a Google Maps JavaScript API key to function.

1.  **Get an API Key:** Follow the instructions on the [Google Maps Platform documentation](https://developers.google.com/maps/documentation/javascript/get-api-key) to get your key.
2.  **Enable the API:** Make sure the "Maps JavaScript API" is enabled for your key in the Google Cloud Console.
3.  **Create an environment file:** In the root of the project, create a file named `.env.local`.
4.  **Add your key:** Add your API key to the `.env.local` file like this:
    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
    ```
    Replace `YOUR_API_KEY_HERE` with the actual key you obtained from Google.

### 4. Running the Development Server

Once the installation and API key setup is complete, you can start the local development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
