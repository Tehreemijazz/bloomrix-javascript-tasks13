
// ===============================
// API MODULE
// Handles all data requests
// ===============================

const COURSES_URL = "./data/courses.json";
const CATEGORIES_URL = "./data/categories.json";

// Fetch and safely parse JSON
async function fetchJSON(url, signal) {

    const response = await fetch(url, {

        method: "GET",

        headers: {
            "Accept": "application/json"
        },

        signal

    });

    // Handle HTTP errors
    if (!response.ok) {
        throw new Error(
            `HTTP Error: ${response.status} ${response.statusText}`
        );
    }

    // Read response as text first
    const text = await response.text();

    // Handle empty response
    if (!text.trim()) {
        throw new Error("The API returned an empty response.");
    }

    // Handle invalid JSON
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("The API returned invalid JSON data.");
    }

}

// Load courses and categories together
export async function getAllData(signal) {

    try {

        const [courses, categories] = await Promise.all([

            fetchJSON(COURSES_URL, signal),

            fetchJSON(CATEGORIES_URL, signal)

        ]);

        // Validate top-level response types
        if (!Array.isArray(courses)) {
            throw new Error("Courses data must be an array.");
        }

        if (!Array.isArray(categories)) {
            throw new Error("Categories data must be an array.");
        }

        return {
            courses,
            categories
        };

    } catch (error) {

        if (error.name === "AbortError") {
            throw error;
        }

        throw error;

    }

}

// Example POST request for API practice.
// JSONPlaceholder is a testing API, not our course database.
export async function createDemoCourse(course) {

    const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify(course)
        }
    );

    if (!response.ok) {
        throw new Error(`POST failed: ${response.status}`);
    }

    return response.json();

}

// Named export and default export example
export default getAllData;
