
// ===============================
// MAIN APPLICATION
// ===============================

import getAllData, { getAllData as loadCourseData } from "./api.js";

import {
    showLoading,
    showError,
    showEmpty,
    renderCategories,
    renderCourses,
    renderStatistics
} from "./ui.js";

// ===============================
// HTML ELEMENTS
// ===============================

const searchInput = document.getElementById("searchInput");

const categoryFilter = document.getElementById("categoryFilter");

const sortFilter = document.getElementById("sortFilter");

const reloadButton = document.getElementById("reloadButton");

// ===============================
// APPLICATION DATA
// ===============================

let allCourses = [];

let allCategories = [];

let controller = null;

let searchTimer = null;

// Use default import as a module example
console.log("Default export available:", getAllData === loadCourseData);

// ===============================
// DATA VALIDATION
// ===============================

function validateCourse(course) {

    return (

        course !== null &&

        typeof course === "object" &&

        Number.isInteger(course.id) &&

        typeof course.title === "string" &&
        course.title.trim() !== "" &&

        typeof course.category === "string" &&
        course.category.trim() !== "" &&

        typeof course.description === "string" &&

        typeof course.duration === "number" &&
        Number.isFinite(course.duration) &&
        course.duration >= 0 &&

        typeof course.level === "string"

    );

}

// ===============================
// LOAD APPLICATION DATA
// ===============================

async function loadData() {

    // Cancel previous request
    if (controller) {

        controller.abort();

    }

    // Create a new request controller
    controller = new AbortController();

    const currentController = controller;

    showLoading();

    reloadButton.disabled = true;

    try {

        // Load two independent datasets
        const data = await loadCourseData(currentController.signal);

        // Validate each course
        allCourses = data.courses.filter(validateCourse);

        // Validate categories
        allCategories = data.categories.filter(category => {

            return (
                typeof category === "string" &&
                category.trim() !== ""
            );

        });

        // Remove duplicate categories
        allCategories = [...new Set(allCategories)];

        // Ignore stale requests
        if (currentController !== controller) {
            return;
        }

        // Render categories
        renderCategories(allCategories);

        // Render statistics
        renderStatistics(allCourses, allCategories);

        // Restore filters from URL
        restoreURLFilters();

        // Display courses
        applyFilters();

    } catch (error) {

        if (error.name === "AbortError") {

            console.log("Request cancelled.");

            return;

        }

        console.error("Loading error:", error);

        showError(error.message || "Unable to load courses.");

    } finally {

        if (currentController === controller) {

            reloadButton.disabled = false;

        }

    }

}

// ===============================
// RESTORE URL FILTERS
// ===============================

function restoreURLFilters() {

    const params = new URLSearchParams(
        window.location.search
    );

    const search = params.get("search") ?? "";

    const category = params.get("category") ?? "all";

    const sort = params.get("sort") ?? "default";

    searchInput.value = search;

    // Only allow existing categories
    categoryFilter.value = allCategories.includes(category)
        ? category
        : "all";

    const validSorts = [
        "default",
        "title",
        "duration",
        "duration-desc",
        "level"
    ];

    sortFilter.value = validSorts.includes(sort)
        ? sort
        : "default";

}

// ===============================
// UPDATE URL
// ===============================

function updateURL() {

    const params = new URLSearchParams();

    const search = searchInput.value.trim();

    const category = categoryFilter.value;

    const sort = sortFilter.value;

    if (search) {

        params.set("search", search);

    }

    if (category !== "all") {

        params.set("category", category);

    }

    if (sort !== "default") {

        params.set("sort", sort);

    }

    const queryString = params.toString();

    const newURL = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

    window.history.replaceState(
        {},
        "",
        newURL
    );

}

// ===============================
// GROUP COURSES BY CATEGORY
// ===============================

function groupCourses(courses) {

    return courses.reduce((groups, course) => {

        const category = course.category;

        if (!groups[category]) {

            groups[category] = [];

        }

        groups[category].push(course);

        return groups;

    }, {});

}

// ===============================
// SEARCH, FILTER AND SORT
// ===============================

function applyFilters() {

    const search = searchInput.value
        .toLowerCase()
        .trim();

    const category = categoryFilter.value;

    const sort = sortFilter.value;

    // Filter courses
    let filteredCourses = allCourses.filter(course => {

        const matchesSearch =

            course.title.toLowerCase().includes(search) ||

            course.description.toLowerCase().includes(search) ||

            course.category.toLowerCase().includes(search);

        const matchesCategory =

            category === "all" ||
            course.category === category;

        return matchesSearch && matchesCategory;

    });

    // Find example: locate a course by ID
    const firstCourse = filteredCourses.find(course => {

        return course.id === 1;

    });

    console.log("Matching course with ID 1:", firstCourse);

    // Sort courses
    if (sort === "title") {

        filteredCourses.sort((a, b) => {

            return a.title.localeCompare(b.title);

        });

    } else if (sort === "duration") {

        filteredCourses.sort((a, b) => {

            return a.duration - b.duration;

        });

    } else if (sort === "duration-desc") {

        filteredCourses.sort((a, b) => {

            return b.duration - a.duration;

        });

    } else if (sort === "level") {

        filteredCourses.sort((a, b) => {

            return a.level.localeCompare(b.level);

        });

    }

    // Grouping example
    const groupedCourses = groupCourses(filteredCourses);

    console.log("Courses grouped by category:", groupedCourses);

    // Update URL
    updateURL();

    // Display results
    if (filteredCourses.length === 0) {

        showEmpty();

    } else {

        renderCourses(filteredCourses);

    }

}

// ===============================
// DEBOUNCE FUNCTION
// ===============================

function debounce(callback, delay = 400) {

    return function (...args) {

        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

// ===============================
// EVENT LISTENERS
// ===============================

// Search
searchInput.addEventListener(
    "input",
    debounce(applyFilters, 400)
);

// Category
categoryFilter.addEventListener(
    "change",
    applyFilters
);

// Sorting
sortFilter.addEventListener(
    "change",
    applyFilters
);

// Reload
reloadButton.addEventListener(
    "click",
    loadData
);

// Restore URL filters when using browser navigation
window.addEventListener("popstate", () => {

    restoreURLFilters();

    applyFilters();

});

// ===============================
// START APPLICATION
// ===============================

loadData();
